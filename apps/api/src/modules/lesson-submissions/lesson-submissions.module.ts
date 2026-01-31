import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonSubmissionsService } from './lesson-submissions.service';
import { LessonSubmissionsController } from './lesson-submissions.controller';
import { LessonSubmission } from './entities/lesson-submission.entity';
import { GamificationModule } from '../gamification/gamification.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LessonSubmission]),
    GamificationModule,
    UsersModule,
  ],
  controllers: [LessonSubmissionsController],
  providers: [LessonSubmissionsService],
  exports: [LessonSubmissionsService],
})
export class LessonSubmissionsModule {}
