import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateMentorshipRequestDto {
  @IsNotEmpty()
  @IsString()
  mentorId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  message: string;
}
