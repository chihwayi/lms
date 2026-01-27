import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonSubmissionsService } from './lesson-submissions.service';
import { LessonSubmissionsController } from './lesson-submissions.controller';
import { LessonSubmission } from './entities/lesson-submission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LessonSubmission])],
  controllers: [LessonSubmissionsController],
  providers: [LessonSubmissionsService],
  exports: [LessonSubmissionsService],
})
export class LessonSubmissionsModule {}
