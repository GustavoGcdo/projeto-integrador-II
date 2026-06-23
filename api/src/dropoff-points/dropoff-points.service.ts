import { Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, eq, ilike, inArray } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service';
import {
  addresses,
  dropoffPoints,
  dropoffPointWasteTypes,
  wasteTypes,
} from '../database/schema';
import { WasteTypesService } from '../waste-types/waste-types.service';
import { CreateDropoffPointDto } from './dto/create-dropoff-point.dto';
import { DropoffPointQueryDto } from './dto/dropoff-point-query.dto';
import { UpdateDropoffPointDto } from './dto/update-dropoff-point.dto';

@Injectable()
export class DropoffPointsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly wasteTypesService: WasteTypesService,
  ) {}

  async listPublic(query: DropoffPointQueryDto) {
    const conditions = [eq(dropoffPoints.status, 'active')];

    if (query.district) {
      conditions.push(ilike(addresses.district, `%${query.district}%`));
    }

    if (query.q) {
      conditions.push(ilike(dropoffPoints.name, `%${query.q}%`));
    }

    const pointRows = await this.databaseService.db
      .select({
        id: dropoffPoints.id,
        name: dropoffPoints.name,
        validationStatus: dropoffPoints.validationStatus,
        street: addresses.street,
        number: addresses.number,
        district: addresses.district,
        latitude: addresses.latitude,
        longitude: addresses.longitude,
      })
      .from(dropoffPoints)
      .innerJoin(addresses, eq(dropoffPoints.addressId, addresses.id))
      .where(and(...conditions))
      .orderBy(asc(dropoffPoints.name));

    const filteredRows =
      query.wasteTypeId != null
        ? await this.filterByWasteType(pointRows, query.wasteTypeId)
        : pointRows;

    const acceptedWasteMap = await this.getWasteSummaryMap(filteredRows.map((row) => row.id));

    return filteredRows.map((row) => ({
      id: row.id,
      name: row.name,
      addressLine: `${row.street}, ${row.number} - ${row.district}`,
      acceptedWasteSummary: acceptedWasteMap.get(row.id) ?? 'Sem residuos associados.',
      validationStatus: row.validationStatus as 'validated' | 'needs_confirmation',
      latitude: this.parseCoordinate(row.latitude),
      longitude: this.parseCoordinate(row.longitude),
    }));
  }

  async getPublicById(id: number) {
    const row = await this.databaseService.db
      .select({
        id: dropoffPoints.id,
        name: dropoffPoints.name,
        description: dropoffPoints.description,
        phone: dropoffPoints.phone,
        openingHours: dropoffPoints.openingHours,
        status: dropoffPoints.status,
        validationStatus: dropoffPoints.validationStatus,
        updatedAt: dropoffPoints.updatedAt,
        street: addresses.street,
        number: addresses.number,
        district: addresses.district,
        city: addresses.city,
        latitude: addresses.latitude,
        longitude: addresses.longitude,
      })
      .from(dropoffPoints)
      .innerJoin(addresses, eq(dropoffPoints.addressId, addresses.id))
      .where(eq(dropoffPoints.id, id))
      .limit(1);

    const point = row[0];

    if (!point) {
      throw new NotFoundException('Ponto de descarte nao encontrado.');
    }

    const acceptedWaste = await this.databaseService.db
      .select({
        id: wasteTypes.id,
        name: wasteTypes.name,
        note: dropoffPointWasteTypes.note,
      })
      .from(dropoffPointWasteTypes)
      .innerJoin(wasteTypes, eq(dropoffPointWasteTypes.wasteTypeId, wasteTypes.id))
      .where(eq(dropoffPointWasteTypes.dropoffPointId, id));

    return {
      id: point.id,
      name: point.name,
      description: point.description,
      phone: point.phone,
      openingHours: point.openingHours,
      status: point.status,
      validationStatus: point.validationStatus as 'validated' | 'needs_confirmation',
      updatedAt: point.updatedAt.toISOString(),
      addressLine: `${point.street}, ${point.number} - ${point.district}`,
      district: point.district,
      city: point.city,
      latitude: this.parseCoordinate(point.latitude),
      longitude: this.parseCoordinate(point.longitude),
      acceptedWaste,
    };
  }

  async ensureExists(id: number) {
    const point = await this.databaseService.db.query.dropoffPoints.findFirst({
      where: eq(dropoffPoints.id, id),
    });

    if (!point) {
      throw new NotFoundException('Ponto de descarte nao encontrado.');
    }

    return point;
  }

  async listAdmin() {
    const rows = await this.databaseService.db
      .select({
        id: dropoffPoints.id,
        name: dropoffPoints.name,
        status: dropoffPoints.status,
        validationStatus: dropoffPoints.validationStatus,
        street: addresses.street,
        number: addresses.number,
        district: addresses.district,
        latitude: addresses.latitude,
        longitude: addresses.longitude,
      })
      .from(dropoffPoints)
      .innerJoin(addresses, eq(dropoffPoints.addressId, addresses.id))
      .orderBy(asc(dropoffPoints.name));

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      status: row.status,
      validationStatus: row.validationStatus as 'validated' | 'needs_confirmation',
      addressLine: `${row.street}, ${row.number} - ${row.district}`,
      latitude: this.parseCoordinate(row.latitude),
      longitude: this.parseCoordinate(row.longitude),
    }));
  }

  async create(createDropoffPointDto: CreateDropoffPointDto) {
    const { street, number } = this.splitAddressText(createDropoffPointDto.addressText);
    const [address] = await this.databaseService.db
      .insert(addresses)
      .values({
        street,
        number,
        district: createDropoffPointDto.district,
        city: createDropoffPointDto.city,
        state: createDropoffPointDto.state ?? 'MS',
        latitude: this.toCoordinateString(createDropoffPointDto.latitude),
        longitude: this.toCoordinateString(createDropoffPointDto.longitude),
      })
      .returning();

    const [point] = await this.databaseService.db
      .insert(dropoffPoints)
      .values({
        name: createDropoffPointDto.name,
        description: createDropoffPointDto.description,
        phone: createDropoffPointDto.phone,
        openingHours: createDropoffPointDto.openingHours,
        addressId: address.id,
      })
      .returning();

    if (createDropoffPointDto.wasteTypeIds.length > 0) {
      await this.databaseService.db.insert(dropoffPointWasteTypes).values(
        createDropoffPointDto.wasteTypeIds.map((wasteTypeId) => ({
          dropoffPointId: point.id,
          wasteTypeId,
        })),
      );
    }

    return this.getPublicById(point.id);
  }

  async update(id: number, updateDropoffPointDto: UpdateDropoffPointDto) {
    const current = await this.ensureExists(id);
    const hasAddressUpdate =
      updateDropoffPointDto.addressText != null ||
      updateDropoffPointDto.district != null ||
      updateDropoffPointDto.city != null ||
      updateDropoffPointDto.state != null;

    await this.databaseService.db
      .update(dropoffPoints)
      .set({
        name: updateDropoffPointDto.name ?? current.name,
        description: updateDropoffPointDto.description ?? current.description,
        phone: updateDropoffPointDto.phone ?? current.phone,
        openingHours: updateDropoffPointDto.openingHours ?? current.openingHours,
        updatedAt: new Date(),
      })
      .where(eq(dropoffPoints.id, id));

    if (hasAddressUpdate) {
      const { street, number } = this.splitAddressText(updateDropoffPointDto.addressText ?? '');
      await this.databaseService.db
        .update(addresses)
        .set({
          street: updateDropoffPointDto.addressText ? street : undefined,
          number: updateDropoffPointDto.addressText ? number : undefined,
          district: updateDropoffPointDto.district,
          city: updateDropoffPointDto.city,
          state: updateDropoffPointDto.state,
          latitude:
            updateDropoffPointDto.latitude != null
              ? this.toCoordinateString(updateDropoffPointDto.latitude)
              : hasAddressUpdate
                ? null
                : undefined,
          longitude:
            updateDropoffPointDto.longitude != null
              ? this.toCoordinateString(updateDropoffPointDto.longitude)
              : hasAddressUpdate
                ? null
                : undefined,
        })
        .where(eq(addresses.id, current.addressId));
    } else if (updateDropoffPointDto.latitude != null || updateDropoffPointDto.longitude != null) {
      await this.databaseService.db
        .update(addresses)
        .set({
          latitude:
            updateDropoffPointDto.latitude != null
              ? this.toCoordinateString(updateDropoffPointDto.latitude)
              : undefined,
          longitude:
            updateDropoffPointDto.longitude != null
              ? this.toCoordinateString(updateDropoffPointDto.longitude)
              : undefined,
        })
        .where(eq(addresses.id, current.addressId));
    }

    if (updateDropoffPointDto.wasteTypeIds) {
      await this.databaseService.db
        .delete(dropoffPointWasteTypes)
        .where(eq(dropoffPointWasteTypes.dropoffPointId, id));

      if (updateDropoffPointDto.wasteTypeIds.length > 0) {
        await this.databaseService.db.insert(dropoffPointWasteTypes).values(
          updateDropoffPointDto.wasteTypeIds.map((wasteTypeId) => ({
            dropoffPointId: id,
            wasteTypeId,
          })),
        );
      }
    }

    return this.getPublicById(id);
  }

  async inactivate(id: number) {
    const [updated] = await this.databaseService.db
      .update(dropoffPoints)
      .set({
        status: 'inactive',
        updatedAt: new Date(),
      })
      .where(eq(dropoffPoints.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundException('Ponto de descarte nao encontrado.');
    }

    return {
      id: updated.id,
      status: updated.status,
    };
  }

  async createFromSuggestion(input: {
    placeName: string;
    addressText: string;
    districtText: string;
    cityText: string;
    wasteTypeText: string;
    openingHoursText?: string | null;
    note?: string | null;
    sourceSuggestionId?: number;
    wasteTypeIds?: number[];
    validationStatus?: 'validated' | 'needs_confirmation';
    status?: 'active' | 'inactive';
    latitude?: number;
    longitude?: number;
  }) {
    const wasteTypeIds =
      input.wasteTypeIds && input.wasteTypeIds.length > 0
        ? input.wasteTypeIds
        : await this.inferWasteTypeIds(input.wasteTypeText);

    return this.create({
      name: input.placeName,
      description: input.note ?? undefined,
      openingHours: input.openingHoursText ?? undefined,
      addressText: input.addressText,
      district: input.districtText,
      city: input.cityText,
      latitude: input.latitude,
      longitude: input.longitude,
      wasteTypeIds,
      state: 'MS',
    }).then(async (createdPoint) => {
      await this.databaseService.db
        .update(dropoffPoints)
        .set({
          status: input.status ?? 'active',
          validationStatus: input.validationStatus ?? 'validated',
          sourceSuggestionId: input.sourceSuggestionId,
        })
        .where(eq(dropoffPoints.id, createdPoint.id));

      return this.getPublicById(createdPoint.id);
    });
  }

  async applyCorrection(
    pointId: number,
    changes: {
      placeName?: string;
      addressText?: string;
      districtText?: string;
      cityText?: string;
      latitude?: number;
      longitude?: number;
      wasteTypeText?: string;
      openingHoursText?: string | null;
      note?: string | null;
      wasteTypeIds?: number[];
    },
  ) {
    const current = await this.ensureExists(pointId);
    const hasAddressUpdate =
      changes.addressText != null ||
      changes.districtText != null ||
      changes.cityText != null;

    await this.databaseService.db
      .update(dropoffPoints)
      .set({
        name: changes.placeName ?? current.name,
        openingHours: changes.openingHoursText ?? current.openingHours,
        description: changes.note ?? current.description,
        updatedAt: new Date(),
      })
      .where(eq(dropoffPoints.id, pointId));

    if (hasAddressUpdate) {
      const parsed = this.splitAddressText(changes.addressText ?? '');
      await this.databaseService.db
        .update(addresses)
        .set({
          street: changes.addressText ? parsed.street : undefined,
          number: changes.addressText ? parsed.number : undefined,
          district: changes.districtText,
          city: changes.cityText,
          latitude:
            changes.latitude != null
              ? this.toCoordinateString(changes.latitude)
              : hasAddressUpdate
                ? null
                : undefined,
          longitude:
            changes.longitude != null
              ? this.toCoordinateString(changes.longitude)
              : hasAddressUpdate
                ? null
                : undefined,
        })
        .where(eq(addresses.id, current.addressId));
    } else if (changes.latitude != null || changes.longitude != null) {
      await this.databaseService.db
        .update(addresses)
        .set({
          latitude: changes.latitude != null ? this.toCoordinateString(changes.latitude) : undefined,
          longitude: changes.longitude != null ? this.toCoordinateString(changes.longitude) : undefined,
        })
        .where(eq(addresses.id, current.addressId));
    }

    const resolvedWasteTypeIds =
      changes.wasteTypeIds && changes.wasteTypeIds.length > 0
        ? changes.wasteTypeIds
        : changes.wasteTypeText
          ? await this.inferWasteTypeIds(changes.wasteTypeText)
          : undefined;

    if (resolvedWasteTypeIds && resolvedWasteTypeIds.length > 0) {
      await this.databaseService.db
        .delete(dropoffPointWasteTypes)
        .where(eq(dropoffPointWasteTypes.dropoffPointId, pointId));

      await this.databaseService.db.insert(dropoffPointWasteTypes).values(
        resolvedWasteTypeIds.map((wasteTypeId) => ({
          dropoffPointId: pointId,
          wasteTypeId,
        })),
      );
    }

    return this.getPublicById(pointId);
  }

  private async filterByWasteType<T extends { id: number }>(rows: T[], wasteTypeId: number) {
    const links = await this.databaseService.db
      .select({ dropoffPointId: dropoffPointWasteTypes.dropoffPointId })
      .from(dropoffPointWasteTypes)
      .where(eq(dropoffPointWasteTypes.wasteTypeId, wasteTypeId));

    const allowedIds = new Set(links.map((link) => link.dropoffPointId));
    return rows.filter((row) => allowedIds.has(row.id));
  }

  private async getWasteSummaryMap(pointIds: number[]) {
    if (pointIds.length === 0) {
      return new Map<number, string>();
    }

    const rows = await this.databaseService.db
      .select({
        dropoffPointId: dropoffPointWasteTypes.dropoffPointId,
        wasteTypeName: wasteTypes.name,
      })
      .from(dropoffPointWasteTypes)
      .innerJoin(wasteTypes, eq(dropoffPointWasteTypes.wasteTypeId, wasteTypes.id))
      .where(inArray(dropoffPointWasteTypes.dropoffPointId, pointIds));

    const summary = new Map<number, string[]>();

    for (const row of rows) {
      const current = summary.get(row.dropoffPointId) ?? [];
      current.push(row.wasteTypeName);
      summary.set(row.dropoffPointId, current);
    }

    return new Map<number, string>(
      Array.from(summary.entries()).map(([pointId, names]) => [pointId, `Aceita: ${names.join(', ')}.`]),
    );
  }

  private async inferWasteTypeIds(text: string) {
    const availableTypes = await this.wasteTypesService.listAll();
    return availableTypes
      .filter((type) => text.toLowerCase().includes(type.name.toLowerCase()))
      .map((type) => type.id);
  }

  private splitAddressText(addressText: string) {
    const [street, number = 'S/N'] = addressText.split(',').map((value) => value.trim());
    return {
      street: street || 'Endereco nao informado',
      number: number || 'S/N',
    };
  }

  private toCoordinateString(value?: number) {
    return value != null ? String(value) : null;
  }

  private parseCoordinate(value: string | null) {
    if (!value) {
      return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
}
