import { Module, forwardRef } from '@nestjs/common';
import { DropoffPointsModule } from '../dropoff-points/dropoff-points.module';
import { SuggestionsController } from './suggestions.controller';
import { SuggestionsService } from './suggestions.service';

@Module({
  imports: [forwardRef(() => DropoffPointsModule)],
  controllers: [SuggestionsController],
  providers: [SuggestionsService],
  exports: [SuggestionsService],
})
export class SuggestionsModule {}
