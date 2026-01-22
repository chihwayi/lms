import { IsNotEmpty, IsNumber, Min, Max, IsUUID, IsOptional } from 'class-validator';

export class UpdateProgressDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress: number;

  @IsOptional()
  @IsUUID()
  completedLessonId?: string;

  @IsOptional()
  @IsUUID()
  currentLessonId?: string;
}
