import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserActivity, ActivityType } from './entities/user-activity.entity';
import { Enrollment, EnrollmentStatus } from '../enrollment/entities/enrollment.entity';
import { Course } from '../courses/entities/course.entity';

@Injectable()
export class AnalyticsSeeder {
  private readonly logger = new Logger(AnalyticsSeeder.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserActivity)
    private readonly activityRepository: Repository<UserActivity>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async seed() {
    this.logger.log('Seeding analytics data...');

    const users = await this.userRepository.find({ where: { role: 'learner' } });
    if (users.length === 0) {
      this.logger.warn('No learners found to seed analytics for.');
      return;
    }

    const courses = await this.courseRepository.find();
    if (courses.length === 0) {
      this.logger.warn('No courses found.');
      return;
    }

    // 1. Generate Login Activity (Last 7 days)
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Random number of logins per day (5-20)
      const loginCount = Math.floor(Math.random() * 15) + 5;
      
      for (let j = 0; j < loginCount; j++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const activity = this.activityRepository.create({
          user: randomUser,
          type: ActivityType.LOGIN,
          createdAt: date,
        });
        await this.activityRepository.save(activity);
      }
    }

    // 2. Create At-Risk Students
    // A. Inactive Student
    if (users[0] && courses[0]) {
      const inactiveDate = new Date();
      inactiveDate.setDate(inactiveDate.getDate() - 10); // 10 days ago

      let enrollment = await this.enrollmentRepository.findOne({ 
        where: { userId: users[0].id, courseId: courses[0].id } 
      });

      if (!enrollment) {
        enrollment = this.enrollmentRepository.create({
          user: users[0],
          course: courses[0],
          status: EnrollmentStatus.ENROLLED,
          progress: 10,
        });
      }
      
      enrollment.lastAccessedAt = inactiveDate;
      await this.enrollmentRepository.save(enrollment);
    }

    // B. Stalled Student
    if (users[1] && courses[0]) {
      const stalledDate = new Date();
      stalledDate.setDate(stalledDate.getDate() - 20); // 20 days ago

      let enrollment = await this.enrollmentRepository.findOne({ 
        where: { userId: users[1].id, courseId: courses[0].id } 
      });

      if (!enrollment) {
        enrollment = this.enrollmentRepository.create({
          user: users[1],
          course: courses[0],
          status: EnrollmentStatus.ENROLLED,
        });
      }
      
      enrollment.enrolledAt = stalledDate;
      enrollment.progress = 15; // Low progress
      await this.enrollmentRepository.save(enrollment);
    }

    this.logger.log('Analytics data seeded successfully.');
  }
}
