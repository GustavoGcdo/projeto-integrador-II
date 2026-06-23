import { Controller, Get } from '@nestjs/common';
import { WasteTypesService } from './waste-types.service';

@Controller('waste-types')
export class WasteTypesController {
  constructor(private readonly wasteTypesService: WasteTypesService) {}

  @Get()
  list() {
    return this.wasteTypesService.listActive();
  }
}
