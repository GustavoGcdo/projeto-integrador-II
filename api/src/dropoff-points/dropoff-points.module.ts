import { Module, forwardRef } from '@nestjs/common';
import { SuggestionsModule } from '../suggestions/suggestions.module';
import { WasteTypesModule } from '../waste-types/waste-types.module';
import { DropoffPointsController } from './dropoff-points.controller';
import { DropoffPointsService } from './dropoff-points.service';

@Module({
  imports: [WasteTypesModule, forwardRef(() => SuggestionsModule)],
  controllers: [DropoffPointsController],
  providers: [DropoffPointsService],
  exports: [DropoffPointsService],
})
export class DropoffPointsModule {}
