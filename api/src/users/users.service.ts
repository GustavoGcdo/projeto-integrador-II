import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service';
import { users } from '../database/schema';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findByEmail(email: string) {
    return this.databaseService.db.query.users.findFirst({
      where: eq(users.email, email),
    });
  }

  async findById(id: number) {
    return this.databaseService.db.query.users.findFirst({
      where: eq(users.id, id),
    });
  }
}
