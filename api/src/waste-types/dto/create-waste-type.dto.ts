import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateWasteTypeDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  disposalGuidance?: string;
}
