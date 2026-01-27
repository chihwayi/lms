import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class CertificateElementDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  type: 'text' | 'image' | 'date';

  @IsString()
  @IsNotEmpty()
  field: 'student_name' | 'course_title' | 'completion_date' | 'instructor_name' | 'custom_text';

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsNumber()
  x: number;

  @IsNumber()
  y: number;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  fontSize?: number;

  @IsOptional()
  @IsString()
  fontColor?: string;

  @IsOptional()
  @IsString()
  fontFamily?: string;

  @IsOptional()
  @IsString()
  textAlign?: 'left' | 'center' | 'right';

  @IsOptional()
  @IsString()
  text?: string;
}

export class CreateCertificateTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  background_url: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CertificateElementDto)
  elements: CertificateElementDto[];

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}
