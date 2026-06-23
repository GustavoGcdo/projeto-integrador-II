import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { DropoffPointsModule } from '../dropoff-points/dropoff-points.module';
import { SuggestionsModule } from '../suggestions/suggestions.module';
import { WasteTypesModule } from '../waste-types/waste-types.module';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Module({
  imports: [JwtModule.register({}), DropoffPointsModule, SuggestionsModule, WasteTypesModule],
  controllers: [AdminController],
  providers: [AdminService, JwtAuthGuard],
})
export class AdminModule {}
