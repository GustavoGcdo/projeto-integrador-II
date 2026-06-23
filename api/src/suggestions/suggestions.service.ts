import { Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { and, asc, eq, type SQL } from 'drizzle-orm';
import type { CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { DatabaseService } from '../database/database.service';
import { suggestions } from '../database/schema';
import {
  CreateCorrectionDto,
} from '../dropoff-points/dto/create-correction.dto';
import { DropoffPointsService } from '../dropoff-points/dropoff-points.service';
import { ApproveSuggestionDto } from '../admin/dto/approve-suggestion.dto';
import { RejectSuggestionDto } from '../admin/dto/reject-suggestion.dto';
import { CreateSuggestionDto } from './dto/create-suggestion.dto';
import { UpdateSuggestionDto } from './dto/update-suggestion.dto';
import { AdminSuggestionQueryDto } from '../admin/dto/admin-suggestion-query.dto';

@Injectable()
export class SuggestionsService {
  constructor(
    private readonly databaseService: DatabaseService,
    @Inject(forwardRef(() => DropoffPointsService))
    private readonly dropoffPointsService: DropoffPointsService,
  ) {}

  async createSuggestion(createSuggestionDto: CreateSuggestionDto) {
    const [created] = await this.databaseService.db
      .insert(suggestions)
      .values({
        kind: createSuggestionDto.kind,
        status: 'pending',
        placeName: createSuggestionDto.placeName,
        addressText: createSuggestionDto.addressText,
        districtText: createSuggestionDto.districtText,
        cityText: createSuggestionDto.cityText,
        wasteTypeText: createSuggestionDto.wasteTypeText,
        openingHoursText: createSuggestionDto.openingHoursText,
        note: createSuggestionDto.note,
      })
      .returning();

    return {
      id: created.id,
      status: created.status,
    };
  }

  async createCorrection(pointId: number, createCorrectionDto: CreateCorrectionDto) {
    const point = await this.dropoffPointsService.getPublicById(pointId);

    const [created] = await this.databaseService.db
      .insert(suggestions)
      .values({
        kind: createCorrectionDto.kind,
        status: 'pending',
        placeName: createCorrectionDto.placeName ?? point.name,
        addressText: createCorrectionDto.addressText ?? point.addressLine,
        districtText: createCorrectionDto.districtText ?? point.district,
        cityText: createCorrectionDto.cityText ?? point.city,
        wasteTypeText:
          createCorrectionDto.wasteTypeText ??
          point.acceptedWaste.map((item) => item.name).join(', '),
        openingHoursText: createCorrectionDto.openingHoursText,
        note: createCorrectionDto.note,
        referencePointId: pointId,
      })
      .returning();

    return {
      id: created.id,
      status: created.status,
    };
  }

  async listAdmin(query: AdminSuggestionQueryDto) {
    const conditions: SQL[] = [];

    if (query.status) {
      conditions.push(eq(suggestions.status, query.status));
    }

    if (query.kind) {
      conditions.push(eq(suggestions.kind, query.kind));
    }

    const rows =
      conditions.length > 0
        ? await this.databaseService.db
            .select()
            .from(suggestions)
            .where(and(...conditions))
            .orderBy(asc(suggestions.submittedAt))
        : await this.databaseService.db
            .select()
            .from(suggestions)
            .orderBy(asc(suggestions.submittedAt));

    return rows.map((row) => ({
      id: row.id,
      kind: row.kind as 'new_point' | 'correction',
      status: row.status as 'pending' | 'approved' | 'rejected',
      placeName: row.placeName,
      addressText: row.addressText,
      districtText: row.districtText,
      cityText: row.cityText,
      wasteTypeText: row.wasteTypeText,
      openingHoursText: row.openingHoursText,
      note: row.note,
      referencePointId: row.referencePointId,
      reviewedAt: row.reviewedAt?.toISOString() ?? null,
      submittedAt: row.submittedAt.toISOString(),
    }));
  }

  async updateSuggestion(id: number, updateSuggestionDto: UpdateSuggestionDto) {
    const [updated] = await this.databaseService.db
      .update(suggestions)
      .set(updateSuggestionDto)
      .where(eq(suggestions.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundException('Sugestao nao encontrada.');
    }

    return updated;
  }

  async approveSuggestion(
    id: number,
    approveSuggestionDto: ApproveSuggestionDto,
    reviewer: CurrentUserPayload,
  ) {
    const suggestion = await this.findSuggestion(id);

    if (suggestion.kind === 'new_point') {
      const createdPoint = await this.dropoffPointsService.createFromSuggestion({
        placeName: approveSuggestionDto.placeName ?? suggestion.placeName,
        addressText: approveSuggestionDto.addressText ?? suggestion.addressText,
        districtText: approveSuggestionDto.districtText ?? suggestion.districtText,
        cityText: approveSuggestionDto.cityText ?? suggestion.cityText,
        latitude: approveSuggestionDto.latitude,
        longitude: approveSuggestionDto.longitude,
        wasteTypeText: approveSuggestionDto.wasteTypeText ?? suggestion.wasteTypeText,
        openingHoursText:
          approveSuggestionDto.openingHoursText ?? suggestion.openingHoursText,
        note: approveSuggestionDto.note ?? suggestion.note,
        sourceSuggestionId: suggestion.id,
        wasteTypeIds: approveSuggestionDto.wasteTypeIds,
        validationStatus: approveSuggestionDto.validationStatus,
        status: approveSuggestionDto.status,
      });

      await this.databaseService.db
        .update(suggestions)
        .set({
          status: 'approved',
          reviewedByUserId: reviewer.sub,
          reviewedAt: new Date(),
          generatedPointId: createdPoint.id,
        })
        .where(eq(suggestions.id, id));

      return {
        id,
        status: 'approved',
      };
    }

    await this.dropoffPointsService.applyCorrection(suggestion.referencePointId!, {
      placeName: approveSuggestionDto.placeName ?? suggestion.placeName,
      addressText: approveSuggestionDto.addressText ?? suggestion.addressText,
      districtText: approveSuggestionDto.districtText ?? suggestion.districtText,
      cityText: approveSuggestionDto.cityText ?? suggestion.cityText,
      latitude: approveSuggestionDto.latitude,
      longitude: approveSuggestionDto.longitude,
      wasteTypeText: approveSuggestionDto.wasteTypeText ?? suggestion.wasteTypeText,
      openingHoursText:
        approveSuggestionDto.openingHoursText ?? suggestion.openingHoursText,
      note: approveSuggestionDto.note ?? suggestion.note,
      wasteTypeIds: approveSuggestionDto.wasteTypeIds,
    });

    await this.databaseService.db
      .update(suggestions)
      .set({
        status: 'approved',
        reviewedByUserId: reviewer.sub,
        reviewedAt: new Date(),
      })
      .where(eq(suggestions.id, id));

    return {
      id,
      status: 'approved',
    };
  }

  async rejectSuggestion(
    id: number,
    _rejectSuggestionDto: RejectSuggestionDto,
    reviewer: CurrentUserPayload,
  ) {
    await this.findSuggestion(id);

    await this.databaseService.db
      .update(suggestions)
      .set({
        status: 'rejected',
        reviewedByUserId: reviewer.sub,
        reviewedAt: new Date(),
      })
      .where(eq(suggestions.id, id));

    return {
      id,
      status: 'rejected',
    };
  }

  private async findSuggestion(id: number) {
    const suggestion = await this.databaseService.db.query.suggestions.findFirst({
      where: eq(suggestions.id, id),
    });

    if (!suggestion) {
      throw new NotFoundException('Sugestao nao encontrada.');
    }

    return suggestion;
  }
}
