import { Injectable } from '@nestjs/common';
import { count, eq } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service';
import { dropoffPoints, suggestions } from '../database/schema';

@Injectable()
export class AdminService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getDashboard() {
    const [registeredPoints] = await this.databaseService.db
      .select({ value: count(dropoffPoints.id) })
      .from(dropoffPoints);
    const [pendingSuggestions] = await this.databaseService.db
      .select({ value: count(suggestions.id) })
      .from(suggestions)
      .where(eq(suggestions.status, 'pending'));
    const [validatedPoints] = await this.databaseService.db
      .select({ value: count(dropoffPoints.id) })
      .from(dropoffPoints)
      .where(eq(dropoffPoints.validationStatus, 'validated'));
    const [correctionSuggestions] = await this.databaseService.db
      .select({ value: count(suggestions.id) })
      .from(suggestions)
      .where(eq(suggestions.kind, 'correction'));

    return {
      registeredPoints: registeredPoints.value,
      pendingSuggestions: pendingSuggestions.value,
      validatedPoints: validatedPoints.value,
      correctionSuggestions: correctionSuggestions.value,
    };
  }
}
