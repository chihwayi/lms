import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { MentorshipRequestStatus } from '../entities/mentorship-request.entity';

export class UpdateMentorshipRequestDto {
  @IsEnum(MentorshipRequestStatus)
  status: MentorshipRequestStatus;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  responseMessage?: string;
}
