import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MentorshipService } from './mentorship.service';
import { MentorshipController } from './mentorship.controller';
import { MentorProfile } from './entities/mentor-profile.entity';
import { MentorshipRequest } from './entities/mentorship-request.entity';
import { MentorshipSession } from './entities/mentorship-session.entity';
import { Innovation } from '../innovations/entities/innovation.entity';
import { MailModule } from '../mail/mail.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MentorProfile, 
      MentorshipRequest, 
      MentorshipSession,
      Innovation,
      User
    ]),
    MailModule,
    NotificationsModule
  ],
  controllers: [MentorshipController],
  providers: [MentorshipService],
  exports: [MentorshipService],
})
export class MentorshipModule {}
