import { IsInt, IsOptional, IsString } from 'class-validator';

export class DropoffPointQueryDto {
  @IsOptional()
  @IsInt()
  wasteTypeId?: number;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  q?: string;
}
