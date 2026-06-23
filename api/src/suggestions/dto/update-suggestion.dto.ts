import { IsOptional, IsString } from 'class-validator';

export class UpdateSuggestionDto {
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
