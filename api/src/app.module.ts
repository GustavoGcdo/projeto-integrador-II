import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { DropoffPointsModule } from './dropoff-points/dropoff-points.module';
import { SuggestionsModule } from './suggestions/suggestions.module';
import { UsersModule } from './users/users.module';
import { WasteTypesModule } from './waste-types/waste-types.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    WasteTypesModule,
    DropoffPointsModule,
    SuggestionsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
