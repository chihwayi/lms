import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateInnovationReviewDto {
  @IsNotEmpty()
  @IsUUID()
  innovation_id: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(100)
  score: number;

  @IsOptional()
  @IsString()
  comments?: string;
}
