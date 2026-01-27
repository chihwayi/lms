import { IsString, IsOptional, IsEnum, IsNumber, Min, IsBoolean, IsUUID } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CourseLevel, CourseVisibility } from '../entities/course.entity';
import { LessonContentType } from '../entities/course-lesson.entity';

export class CreateCourseDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  short_description?: string;

  @IsOptional()
  @IsUUID()
  category_id?: string;

  @IsOptional()
  @IsEnum(CourseLevel)
  level?: CourseLevel;

  @IsOptional()
  @IsNumber()
  @Min(0)
  duration_minutes?: number;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  thumbnail_url?: string;

  @IsOptional()
  @IsString()
  trailer_url?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsEnum(CourseVisibility)
  visibility?: CourseVisibility;

  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  max_enrollments?: number;
}

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  short_description?: string;

  @IsOptional()
  @IsUUID()
  category_id?: string;

  @IsOptional()
  @IsEnum(CourseLevel)
  level?: CourseLevel;

  @IsOptional()
  @IsNumber()
  @Min(0)
  duration_minutes?: number;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  thumbnail_url?: string;

  @IsOptional()
  @IsString()
  trailer_url?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsEnum(CourseVisibility)
  visibility?: CourseVisibility;

  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  max_enrollments?: number;
}

export class CreateModuleDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  order_index: number;

  @IsOptional()
  @IsBoolean()
  is_published?: boolean;
}

export class CreateLessonDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(LessonContentType)
  content_type: LessonContentType;

  @IsOptional()
  @IsString()
  content_url?: string;

  @IsOptional()
  content_data?: any;

  @IsOptional()
  @IsNumber()
  @Min(0)
  duration_minutes?: number;

  @IsNumber()
  @Min(0)
  order_index: number;

  @IsOptional()
  @IsBoolean()
  is_published?: boolean;

  @IsOptional()
  @IsBoolean()
  is_preview?: boolean;
}

export class UpdateLessonDto extends PartialType(CreateLessonDto) {}