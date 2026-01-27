import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { SubmissionType } from '../entities/lesson-submission.entity';

export class CreateSubmissionDto {
  @IsUUID()
  @IsNotEmpty()
  lessonId: string;

  @IsString()
  @IsNotEmpty()
  contentBlockId: string;

  @IsEnum(SubmissionType)
  @IsNotEmpty()
  submissionType: SubmissionType;

  @IsString()
  @IsNotEmpty()
  submissionUrl: string;
}
