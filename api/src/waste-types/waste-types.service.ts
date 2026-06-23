import { Injectable, NotFoundException } from '@nestjs/common';
import { asc, eq, inArray } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service';
import { wasteTypes } from '../database/schema';
import { CreateWasteTypeDto } from './dto/create-waste-type.dto';
import { UpdateWasteTypeDto } from './dto/update-waste-type.dto';

@Injectable()
export class WasteTypesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async listActive() {
    const rows = await this.databaseService.db
      .select()
      .from(wasteTypes)
      .where(eq(wasteTypes.active, true))
      .orderBy(asc(wasteTypes.name));

    return rows.map(this.mapWasteType);
  }

  async listAll() {
    const rows = await this.databaseService.db.select().from(wasteTypes).orderBy(asc(wasteTypes.name));
    return rows.map(this.mapWasteType);
  }

  async findMany(ids: number[]) {
    if (ids.length === 0) {
      return [];
    }

    return this.databaseService.db
      .select()
      .from(wasteTypes)
      .where(inArray(wasteTypes.id, ids));
  }

  async create(createWasteTypeDto: CreateWasteTypeDto) {
    const [created] = await this.databaseService.db
      .insert(wasteTypes)
      .values({
        name: createWasteTypeDto.name,
        description: createWasteTypeDto.description,
        disposalGuidance: createWasteTypeDto.disposalGuidance,
      })
      .returning();

    return this.mapWasteType(created);
  }

  async update(id: number, updateWasteTypeDto: UpdateWasteTypeDto) {
    const [updated] = await this.databaseService.db
      .update(wasteTypes)
      .set(updateWasteTypeDto)
      .where(eq(wasteTypes.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundException('Tipo de residuo nao encontrado.');
    }

    return this.mapWasteType(updated);
  }

  private mapWasteType(row: typeof wasteTypes.$inferSelect) {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      disposalGuidance: row.disposalGuidance,
      active: row.active,
    };
  }
}
