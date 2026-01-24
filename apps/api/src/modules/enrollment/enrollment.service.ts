import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Enrollment, EnrollmentStatus } from './entities/enrollment.entity';
import { QuizSubmission } from './entities/quiz-submission.entity';
import { Course } from '../courses/entities/course.entity';
import { CourseLesson } from '../courses/entities/course-lesson.entity';
import { User } from '../users/entities/user.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { GamificationService } from '../gamification/gamification.service';

@Injectable()
export class EnrollmentService implements OnModuleInit {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(QuizSubmission)
    private quizSubmissionRepository: Repository<QuizSubmission>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
    private gamificationService: GamificationService,
  ) {}

  async onModuleInit() {
    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS "enrollments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "course_id" uuid NOT NULL,
        "progress" float NOT NULL DEFAULT 0,
        "completedLessons" text,
        "status" character varying NOT NULL DEFAULT 'enrolled',
        "enrolled_at" TIMESTAMP NOT NULL DEFAULT now(),
        "completed_at" TIMESTAMP,
        CONSTRAINT "PK_enrollments_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_enrollments_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_enrollments_course_id" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE
      );
    `);

    // Add new columns if they don't exist
    const hasLastAccessed = await this.dataSource.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='enrollments' AND column_name='last_accessed_at';
    `);
    
    if (hasLastAccessed.length === 0) {
      await this.dataSource.query(`ALTER TABLE "enrollments" ADD COLUMN "last_accessed_at" TIMESTAMP`);
    }

    const hasLastLesson = await this.dataSource.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='enrollments' AND column_name='last_lesson_id';
    `);
    
    if (hasLastLesson.length === 0) {
      await this.dataSource.query(`ALTER TABLE "enrollments" ADD COLUMN "last_lesson_id" uuid`);
    }
  }

  async enroll(userId: string, createEnrollmentDto: CreateEnrollmentDto): Promise<Enrollment> {
    const { courseId } = createEnrollmentDto;

    const course = await this.courseRepository.findOne({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const existingEnrollment = await this.enrollmentRepository.findOne({
      where: { userId, courseId },
    });

    if (existingEnrollment) {
      throw new BadRequestException('User is already enrolled in this course');
    }

    const enrollment = this.enrollmentRepository.create({
      userId,
      courseId,
      status: EnrollmentStatus.ENROLLED,
      progress: 0,
      completedLessons: [],
      lastAccessedAt: new Date(),
    });

    return this.enrollmentRepository.save(enrollment);
  }

  async findPotentialStudents(courseId: string, search: string): Promise<User[]> {
    if (!search) return [];
    
    return this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.enrollments', 'enrollment', 'enrollment.courseId = :courseId', { courseId })
      .where('enrollment.id IS NULL')
      .andWhere('(user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)', { search: `%${search}%` })
      .take(10)
      .getMany();
  }

  async getEnrolledStudents(courseId: string): Promise<User[]> {
    const enrollments = await this.enrollmentRepository.find({
      where: { courseId, status: EnrollmentStatus.ENROLLED },
      relations: ['user'],
    });
    return enrollments.map(e => e.user);
  }

  async checkEnrollment(userId: string, courseId: string): Promise<{ isEnrolled: boolean; enrollment?: Enrollment }> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { userId, courseId },
    });

    if (enrollment) {
        // Update last accessed time when checking enrollment (often happens on course load)
        enrollment.lastAccessedAt = new Date();
        await this.enrollmentRepository.save(enrollment);
    }

    return {
      isEnrolled: !!enrollment,
      enrollment: enrollment || undefined,
    };
  }

  async updateProgress(userId: string, updateProgressDto: UpdateProgressDto): Promise<Enrollment> {
    const { courseId, lessonId, completed } = updateProgressDto;

    let enrollment = await this.enrollmentRepository.findOne({
      where: { userId, courseId },
      relations: ['course', 'course.modules', 'course.modules.lessons'],
    });

    if (!enrollment) {
      // Auto-enroll if not found (lazy enrollment for progress tracking)
      const course = await this.courseRepository.findOne({ 
        where: { id: courseId },
        relations: ['modules', 'modules.lessons'] 
      });
      
      if (!course) {
        throw new NotFoundException('Course not found');
      }

      enrollment = this.enrollmentRepository.create({
        userId,
        courseId,
        course, // Attach relation for progress calc below
        status: EnrollmentStatus.ENROLLED,
        progress: 0,
        completedLessons: [],
        lastAccessedAt: new Date(),
      });
      
      enrollment = await this.enrollmentRepository.save(enrollment);
    }

    enrollment.lastAccessedAt = new Date();
    enrollment.lastLessonId = lessonId;

    if (completed) {
      if (!enrollment.completedLessons) {
        enrollment.completedLessons = [];
      }
      
      if (!enrollment.completedLessons.includes(lessonId)) {
        enrollment.completedLessons.push(lessonId);
        
        // Award XP for completing a lesson
        await this.gamificationService.awardXP(userId, 5, 'lesson_completed', lessonId);
      }
    }

    // Calculate progress
    const allLessons = enrollment.course.modules.flatMap(m => m.lessons);
    const totalLessons = allLessons.length;
    const completedCount = enrollment.completedLessons.length;
    
    enrollment.progress = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

    if (enrollment.progress === 100 && enrollment.status !== EnrollmentStatus.COMPLETED) {
      enrollment.status = EnrollmentStatus.COMPLETED;
      enrollment.completedAt = new Date();
      
      // Award XP for course completion
      await this.gamificationService.awardXP(userId, 100, 'course_completed', courseId);
      // Unlock achievement
      await this.gamificationService.checkAndUnlockAchievement(userId, 'first-course-completed');
    }

    return this.enrollmentRepository.save(enrollment);
  }

  async submitQuiz(userId: string, enrollmentId: string, lessonId: string, answers: any): Promise<QuizSubmission> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: enrollmentId, userId },
      relations: ['course', 'course.modules', 'course.modules.lessons'],
    });

    if (!enrollment) throw new NotFoundException('Enrollment not found');

    const lesson = enrollment.course.modules
      .flatMap(m => m.lessons)
      .find(l => l.id === lessonId);

    if (!lesson) throw new NotFoundException('Lesson not found');
    if (lesson.content_type !== 'quiz') throw new BadRequestException('Lesson is not a quiz');

    // Calculate Score
    let correctCount = 0;
    const questions = lesson.content_data?.questions || [];
    
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const score = questions.length > 0 ? (correctCount / questions.length) * 100 : 0;
    const passed = score >= (lesson.content_data?.passingScore || 70);

    const submission = this.quizSubmissionRepository.create({
      enrollment_id: enrollmentId,
      lesson_id: lessonId,
      answers,
      score,
      passed,
    });

    const saved = await this.quizSubmissionRepository.save(submission);

    // If passed, mark lesson as completed
    if (passed) {
      await this.updateProgress(userId, {
        courseId: enrollment.courseId,
        lessonId,
        completed: true,
      });

      // Award extra XP for passing a quiz
      await this.gamificationService.awardXP(userId, 20, 'quiz_passed', saved.id);
      
      if (score === 100) {
        await this.gamificationService.awardXP(userId, 10, 'quiz_perfect_score', saved.id);
      }
    }

    return saved;
  }

  async getMyCourses(userId: string): Promise<Enrollment[]> {
    return this.enrollmentRepository.find({
      where: { userId },
      relations: ['course'],
      order: { lastAccessedAt: 'DESC', enrolledAt: 'DESC' },
    });
  }

  async getLastAccessed(userId: string): Promise<Enrollment | null> {
    return this.enrollmentRepository.findOne({
      where: { userId },
      relations: ['course', 'course.modules', 'course.modules.lessons'],
      order: { lastAccessedAt: 'DESC', enrolledAt: 'DESC' },
    });
  }

  async getCourseStudents(courseId: string): Promise<Enrollment[]> {
    return this.enrollmentRepository.find({
      where: { courseId },
      relations: ['user'],
      order: { enrolledAt: 'DESC' },
    });
  }

  async enrollByEmail(courseId: string, email: string): Promise<Enrollment> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found with this email');
    }

    return this.enroll(user.id, { courseId });
  }

  async enrollMany(courseId: string, userIds: string[]): Promise<Enrollment[]> {
    const enrollments: Enrollment[] = [];
    for (const userId of userIds) {
      try {
        const enrollment = await this.enroll(userId, { courseId });
        enrollments.push(enrollment);
      } catch (error) {
        // Skip if already enrolled or other error, but maybe log it
        // For bulk, we usually want to succeed for valid ones
      }
    }
    return enrollments;
  }
}
