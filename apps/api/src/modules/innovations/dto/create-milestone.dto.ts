import { IsString, IsOptional, IsDateString, IsEnum, MinLength } from 'class-validator';
import { MilestoneStatus } from '../entities/innovation-milestone.entity';

export class CreateMilestoneDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  due_date?: string;

  @IsOptional()
  @IsEnum(MilestoneStatus)
  status?: MilestoneStatus;
}
