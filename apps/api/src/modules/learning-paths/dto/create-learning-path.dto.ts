import { IsString, IsOptional, IsArray, IsUUID } from 'class-validator';

export class CreateLearningPathDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  courseIds: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
