import { IsNotEmpty, IsNumber, IsUUID, IsOptional, IsBoolean } from 'class-validator';

export class UpdateProgressDto {
  @IsNotEmpty()
  @IsUUID()
  courseId: string;

  @IsNotEmpty()
  @IsUUID()
  lessonId: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsNumber()
  lastPosition?: number;

  @IsOptional()
  @IsNumber()
  totalDuration?: number;
}
