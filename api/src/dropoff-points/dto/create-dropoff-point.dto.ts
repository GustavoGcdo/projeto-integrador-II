import { IsArray, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateDropoffPointDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  openingHours?: string;

  @IsString()
  addressText!: string;

  @IsString()
  district!: string;

  @IsString()
  city!: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @IsArray()
  wasteTypeIds!: number[];
}
