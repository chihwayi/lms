import { IsNotEmpty, IsNumber, Min, Max, IsUUID, IsOptional, IsBoolean } from 'class-validator';

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
}
