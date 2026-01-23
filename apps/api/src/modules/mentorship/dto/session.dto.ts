import { IsString, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { SessionStatus } from '../entities/mentorship-session.entity';

export class CreateSessionDto {
  @IsString()
  mentorId: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateSessionDto {
  @IsOptional()
  @IsEnum(SessionStatus)
  status?: SessionStatus;

  @IsOptional()
  @IsString()
  meetingLink?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
