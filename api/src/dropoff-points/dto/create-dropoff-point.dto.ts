import { IsArray, IsOptional, IsString } from 'class-validator';

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

  @IsArray()
  wasteTypeIds!: number[];
}
