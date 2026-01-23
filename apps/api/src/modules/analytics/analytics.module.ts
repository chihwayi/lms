import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsSeeder } from './analytics.seeder';
import { UserActivity } from './entities/user-activity.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { QuizSubmission } from '../enrollment/entities/quiz-submission.entity';
import { User } from '../users/entities/user.entity';
import { Course } from '../courses/entities/course.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([UserActivity, Enrollment, QuizSubmission, User, Course]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsSeeder],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
