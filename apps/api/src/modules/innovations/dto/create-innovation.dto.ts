import { IsString, IsOptional, IsNumber, IsEnum, MinLength } from 'class-validator';
import { InnovationStatus } from '../entities/innovation.entity';

export class CreateInnovationDto {
  @IsString()
  @MinLength(5)
  title: string;

  @IsString()
  @MinLength(20)
  problem_statement: string;

  @IsString()
  @MinLength(20)
  solution_description: string;

  @IsOptional()
  @IsNumber()
  budget_estimate?: number;

  @IsOptional()
  @IsEnum(InnovationStatus)
  status?: InnovationStatus;
}
