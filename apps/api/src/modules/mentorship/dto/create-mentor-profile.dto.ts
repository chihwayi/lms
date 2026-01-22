import { IsString, IsNotEmpty, IsArray, IsNumber, IsOptional, IsUrl, IsBoolean, Min } from 'class-validator';

export class CreateMentorProfileDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  company: string;

  @IsString()
  @IsNotEmpty()
  bio: string;

  @IsArray()
  @IsString({ each: true })
  expertise: string[];

  @IsNumber()
  @Min(0)
  yearsOfExperience: number;

  @IsOptional()
  @IsUrl()
  linkedinUrl?: string;

  @IsOptional()
  @IsUrl()
  websiteUrl?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxMentees?: number;
}
