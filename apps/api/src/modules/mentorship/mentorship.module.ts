import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MentorshipService } from './mentorship.service';
import { MentorshipController } from './mentorship.controller';
import { MentorProfile } from './entities/mentor-profile.entity';

import { MentorshipRequest } from './entities/mentorship-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MentorProfile, MentorshipRequest])],
  controllers: [MentorshipController],
  providers: [MentorshipService],
  exports: [MentorshipService],
})
export class MentorshipModule {}
