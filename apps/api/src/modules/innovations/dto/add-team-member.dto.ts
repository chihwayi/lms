import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { TeamRole } from '../entities/innovation-member.entity';

export class AddTeamMemberDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(TeamRole)
  role?: TeamRole;
}
