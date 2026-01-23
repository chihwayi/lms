import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import { UserActivity, ActivityType } from './entities/user-activity.entity';
import { Enrollment, EnrollmentStatus } from '../enrollment/entities/enrollment.entity';
import { QuizSubmission } from '../enrollment/entities/quiz-submission.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(UserActivity)
    private readonly activityRepository: Repository<UserActivity>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(QuizSubmission)
    private readonly quizSubmissionRepository: Repository<QuizSubmission>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getCourseInsights() {
    // Drop-off Analysis: Aggregate progress buckets (0-20%, 21-40%, etc.)
    const progressDistribution = await this.enrollmentRepository.createQueryBuilder('enrollment')
      .select('FLOOR(enrollment.progress / 20) * 20', 'range_start')
      .addSelect('COUNT(*)', 'count')
      .groupBy('range_start')
      .orderBy('range_start', 'ASC')
      .getRawMany();

    // Map raw results to friendly buckets
    const ranges = [0, 20, 40, 60, 80, 100];
    const distribution = ranges.map(r => {
      const found = progressDistribution.find(p => parseInt(p.range_start) === r);
      return {
        range: `${r}-${r + 19}%`,
        count: found ? parseInt(found.count) : 0
      };
    });

    return {
      progressDistribution: distribution
    };
  }

  async getQuizAnalytics() {
    try {
      // Average score per quiz (lesson)
      const quizStats = await this.quizSubmissionRepository.createQueryBuilder('submission')
        .leftJoin('submission.lesson', 'lesson')
        .select('lesson.title', 'lessonTitle')
        .addSelect('AVG(submission.score)', 'avg_score')
        .addSelect('COUNT(*)', 'attempts')
        .groupBy('lesson.id')
        .addGroupBy('lesson.title')
        .orderBy('avg_score', 'ASC') // Show hardest quizzes first
        .limit(10)
        .getRawMany();

      return {
        quizStats: quizStats.map(s => ({
          lesson: s.lessonTitle,
          avgScore: parseFloat(parseFloat(s.avg_score).toFixed(1)),
          attempts: parseInt(s.attempts)
        }))
      };
    } catch (error) {
      console.error('Error getting quiz analytics:', error);
      throw error;
    }
  }

  async logActivity(userId: string, type: ActivityType, metadata?: any) {
    const activity = this.activityRepository.create({
      user_id: userId,
      type,
      metadata,
    });
    return await this.activityRepository.save(activity);
  }

  async getDashboardStats() {
    const totalStudents = await this.userRepository.count({ where: { role: 'learner' } });
    const totalEnrollments = await this.enrollmentRepository.count();
    const courseCompletions = await this.enrollmentRepository.count({ where: { status: EnrollmentStatus.COMPLETED } });

    // Login activity for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const loginActivity = await this.activityRepository
      .createQueryBuilder('activity')
      .select("DATE(activity.created_at) as date, COUNT(*) as count")
      .where("activity.type = :type", { type: ActivityType.LOGIN })
      .andWhere("activity.created_at >= :date", { date: sevenDaysAgo })
      .groupBy("DATE(activity.created_at)")
      .orderBy("date", "ASC")
      .getRawMany();

    return {
      totalStudents,
      totalEnrollments,
      courseCompletions,
      loginActivity,
    };
  }

  async getAtRiskStudents() {
    // 1. Students with low engagement (no login/access in 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const inactiveEnrollments = await this.enrollmentRepository.find({
      where: {
        lastAccessedAt: LessThan(sevenDaysAgo),
        status: EnrollmentStatus.ENROLLED,
      },
      relations: ['user', 'course'],
    });

    // 2. Students with low progress (enrolled > 14 days ago and progress < 20%)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const stalledEnrollments = await this.enrollmentRepository.find({
      where: {
        enrolledAt: LessThan(fourteenDaysAgo),
        progress: LessThan(20),
        status: EnrollmentStatus.ENROLLED,
      },
      relations: ['user', 'course'],
    });

    // 3. Students failing quizzes (average score < 60%)
    // This is more complex, let's just find recent failed submissions for now
    const failedSubmissions = await this.quizSubmissionRepository.find({
      where: {
        passed: false,
      },
      relations: ['enrollment', 'enrollment.user', 'enrollment.course'],
      take: 20, // Limit to recent ones
      order: { created_at: 'DESC' }
    });

    return {
      inactiveStudents: inactiveEnrollments.map(e => ({
        id: e.user.id,
        name: `${e.user.firstName} ${e.user.lastName}`,
        email: e.user.email,
        course: e.course.title,
        lastAccess: e.lastAccessedAt,
        reason: 'Inactive > 7 days'
      })),
      stalledStudents: stalledEnrollments.map(e => ({
        id: e.user.id,
        name: `${e.user.firstName} ${e.user.lastName}`,
        email: e.user.email,
        course: e.course.title,
        progress: e.progress,
        reason: 'Low Progress (< 20%)'
      })),
      failingStudents: failedSubmissions.map(s => ({
        id: s.enrollment.user.id,
        name: `${s.enrollment.user.firstName} ${s.enrollment.user.lastName}`,
        email: s.enrollment.user.email,
        course: s.enrollment.course.title,
        score: s.score,
        reason: 'Failed Quiz'
      })),
    };
  }
}
