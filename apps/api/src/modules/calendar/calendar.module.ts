import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { InnovationMilestone } from '../innovations/entities/innovation-milestone.entity';
import { LiveSession } from '../live-sessions/entities/live-session.entity';
import { Enrollment } from '../enrollment/entities/enrollment.entity';
import { Course } from '../courses/entities/course.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InnovationMilestone,
      LiveSession,
      Enrollment,
      Course
    ]),
  ],
  controllers: [CalendarController],
  providers: [CalendarService],
  exports: [CalendarService],
})
export class CalendarModule {}
