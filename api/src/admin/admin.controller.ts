import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser, type CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { DropoffPointsService } from '../dropoff-points/dropoff-points.service';
import { CreateDropoffPointDto } from '../dropoff-points/dto/create-dropoff-point.dto';
import { UpdateDropoffPointDto } from '../dropoff-points/dto/update-dropoff-point.dto';
import { WasteTypesService } from '../waste-types/waste-types.service';
import { CreateWasteTypeDto } from '../waste-types/dto/create-waste-type.dto';
import { UpdateWasteTypeDto } from '../waste-types/dto/update-waste-type.dto';
import { AdminService } from './admin.service';
import { AdminSuggestionQueryDto } from './dto/admin-suggestion-query.dto';
import { ApproveSuggestionDto } from './dto/approve-suggestion.dto';
import { RejectSuggestionDto } from './dto/reject-suggestion.dto';
import { SuggestionsService } from '../suggestions/suggestions.service';
import { UpdateSuggestionDto } from '../suggestions/dto/update-suggestion.dto';

@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly suggestionsService: SuggestionsService,
    private readonly dropoffPointsService: DropoffPointsService,
    private readonly wasteTypesService: WasteTypesService,
  ) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('suggestions')
  listSuggestions(@Query() query: AdminSuggestionQueryDto) {
    return this.suggestionsService.listAdmin(query);
  }

  @Patch('suggestions/:id')
  updateSuggestion(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSuggestionDto: UpdateSuggestionDto,
  ) {
    return this.suggestionsService.updateSuggestion(id, updateSuggestionDto);
  }

  @Post('suggestions/:id/approve')
  approveSuggestion(
    @Param('id', ParseIntPipe) id: number,
    @Body() approveSuggestionDto: ApproveSuggestionDto,
    @CurrentUser() reviewer: CurrentUserPayload,
  ) {
    return this.suggestionsService.approveSuggestion(id, approveSuggestionDto, reviewer);
  }

  @Post('suggestions/:id/reject')
  rejectSuggestion(
    @Param('id', ParseIntPipe) id: number,
    @Body() rejectSuggestionDto: RejectSuggestionDto,
    @CurrentUser() reviewer: CurrentUserPayload,
  ) {
    return this.suggestionsService.rejectSuggestion(id, rejectSuggestionDto, reviewer);
  }

  @Get('dropoff-points')
  listPoints() {
    return this.dropoffPointsService.listAdmin();
  }

  @Post('dropoff-points')
  createPoint(@Body() createDropoffPointDto: CreateDropoffPointDto) {
    return this.dropoffPointsService.create(createDropoffPointDto);
  }

  @Patch('dropoff-points/:id')
  updatePoint(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDropoffPointDto: UpdateDropoffPointDto,
  ) {
    return this.dropoffPointsService.update(id, updateDropoffPointDto);
  }

  @Patch('dropoff-points/:id/inactivate')
  inactivatePoint(@Param('id', ParseIntPipe) id: number) {
    return this.dropoffPointsService.inactivate(id);
  }

  @Get('waste-types')
  listWasteTypes() {
    return this.wasteTypesService.listAll();
  }

  @Post('waste-types')
  createWasteType(@Body() createWasteTypeDto: CreateWasteTypeDto) {
    return this.wasteTypesService.create(createWasteTypeDto);
  }

  @Patch('waste-types/:id')
  updateWasteType(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWasteTypeDto: UpdateWasteTypeDto,
  ) {
    return this.wasteTypesService.update(id, updateWasteTypeDto);
  }
}
