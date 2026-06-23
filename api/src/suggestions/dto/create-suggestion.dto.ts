import { IsIn, IsOptional, IsString } from 'class-validator';

export class CreateSuggestionDto {
  @IsIn(['new_point'])
  kind!: 'new_point';

  @IsString()
  placeName!: string;

  @IsString()
  addressText!: string;

  @IsString()
  districtText!: string;

  @IsString()
  cityText!: string;

  @IsString()
  wasteTypeText!: string;

  @IsOptional()
  @IsString()
  openingHoursText?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
