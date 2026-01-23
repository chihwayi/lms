import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, IsUUID, IsDateString } from 'class-validator';
import { SessionPlatform, SessionStatus } from '../entities/live-session.entity';

export class CreateLiveSessionDto {
  @IsUUID()
  @IsNotEmpty()
  course_id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsNotEmpty()
  start_time: string;

  @IsDateString()
  @IsNotEmpty()
  end_time: string;

  @IsUrl()
  @IsNotEmpty()
  meeting_link: string;

  @IsEnum(SessionPlatform)
  @IsOptional()
  platform?: SessionPlatform;
}
