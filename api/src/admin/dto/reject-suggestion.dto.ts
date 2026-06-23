import { IsOptional, IsString } from 'class-validator';

export class RejectSuggestionDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
