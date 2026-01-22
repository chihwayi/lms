import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { InnovationStatus } from '../entities/innovation.entity';

export class ReviewInnovationDto {
  @IsEnum(InnovationStatus)
  status: InnovationStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  allocated_budget?: number;
}
