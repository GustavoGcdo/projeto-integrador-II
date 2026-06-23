import { IsIn, IsOptional } from 'class-validator';

export class AdminSuggestionQueryDto {
  @IsOptional()
  @IsIn(['pending', 'approved', 'rejected'])
  status?: 'pending' | 'approved' | 'rejected';

  @IsOptional()
  @IsIn(['new_point', 'correction'])
  kind?: 'new_point' | 'correction';
}
