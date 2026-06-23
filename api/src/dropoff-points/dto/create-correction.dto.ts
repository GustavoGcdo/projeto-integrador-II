import { IsIn, IsOptional, IsString } from 'class-validator';

export class CreateCorrectionDto {
  @IsIn(['correction'])
  kind!: 'correction';

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

  @IsString()
  note!: string;
}
