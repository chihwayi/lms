import { PartialType } from '@nestjs/mapped-types';
import { CreateLiveSessionDto } from './create-live-session.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { SessionStatus } from '../entities/live-session.entity';

export class UpdateLiveSessionDto extends PartialType(CreateLiveSessionDto) {
  @IsEnum(SessionStatus)
  @IsOptional()
  status?: SessionStatus;
}
