import { PartialType } from '@nestjs/mapped-types';
import { CreateMentorProfileDto } from './create-mentor-profile.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateMentorProfileDto extends PartialType(CreateMentorProfileDto) {
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
