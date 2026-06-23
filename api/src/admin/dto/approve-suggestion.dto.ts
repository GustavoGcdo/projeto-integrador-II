import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';

export class ApproveSuggestionDto {
  @IsOptional()
  @IsArray()
  wasteTypeIds?: number[];

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';

  @IsOptional()
  @IsIn(['validated', 'needs_confirmation'])
  validationStatus?: 'validated' | 'needs_confirmation';

  @IsOptional()
  @IsString()
  placeName?: string;

  @IsOptional()
  @IsString()
  addressText?: string;

  @IsOptional()
  @IsString()
  districtText?: string;

  @IsOptional()
  @IsString()
  cityText?: string;

  @IsOptional()
  @IsString()
  wasteTypeText?: string;

  @IsOptional()
  @IsString()
  openingHoursText?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
