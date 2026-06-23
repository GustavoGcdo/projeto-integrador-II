import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { SuggestionsService } from '../suggestions/suggestions.service';
import { CreateCorrectionDto } from './dto/create-correction.dto';
import { DropoffPointQueryDto } from './dto/dropoff-point-query.dto';
import { DropoffPointsService } from './dropoff-points.service';

@Controller('dropoff-points')
export class DropoffPointsController {
  constructor(
    private readonly dropoffPointsService: DropoffPointsService,
    private readonly suggestionsService: SuggestionsService,
  ) {}

  @Get()
  list(@Query() query: DropoffPointQueryDto) {
    return this.dropoffPointsService.listPublic(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.dropoffPointsService.getPublicById(id);
  }

  @Post(':id/corrections')
  createCorrection(
    @Param('id', ParseIntPipe) id: number,
    @Body() createCorrectionDto: CreateCorrectionDto,
  ) {
    return this.suggestionsService.createCorrection(id, createCorrectionDto);
  }
}
