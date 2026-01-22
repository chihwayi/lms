import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Enrollment, EnrollmentStatus } from './entities/enrollment.entity';
import { Course } from '../courses/entities/course.entity';
import { CourseLesson } from '../courses/entities/course-lesson.entity';
import { User } from '../users/entities/user.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';

@Injectable()
export class EnrollmentService implements OnModuleInit {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
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
      .andWhere('(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)', { search: `%${search}%` })
      .take(20)
      .getMany();
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

  async updateProgress(userId: string, courseId: string, updateProgressDto: UpdateProgressDto): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { userId, courseId },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    // Update last accessed time
    enrollment.lastAccessedAt = new Date();

    if (updateProgressDto.currentLessonId) {
        enrollment.lastLessonId = updateProgressDto.currentLessonId;
    }

    if (updateProgressDto.completedLessonId) {
        if (!enrollment.completedLessons) {
            enrollment.completedLessons = [];
        }
        if (!enrollment.completedLessons.includes(updateProgressDto.completedLessonId)) {
            enrollment.completedLessons.push(updateProgressDto.completedLessonId);
        }
        
        // Recalculate progress based on actual completed lessons vs total published lessons
        const courseLessonRepo = this.dataSource.getRepository(CourseLesson);
        
        const totalLessons = await courseLessonRepo
            .createQueryBuilder('lesson')
            .innerJoin('lesson.module', 'module')
            .where('module.course_id = :courseId', { courseId })
            .andWhere('lesson.is_published = :isPublished', { isPublished: true })
            .getCount();

        let completedCount = 0;
        if (enrollment.completedLessons.length > 0) {
             completedCount = await courseLessonRepo
                .createQueryBuilder('lesson')
                .innerJoin('lesson.module', 'module')
                .where('module.course_id = :courseId', { courseId })
                .andWhere('lesson.is_published = :isPublished', { isPublished: true })
                .andWhere('lesson.id IN (:...ids)', { ids: enrollment.completedLessons })
                .getCount();
        }

        if (totalLessons > 0) {
            enrollment.progress = (completedCount / totalLessons) * 100;
        } else {
            enrollment.progress = (completedCount > 0) ? 100 : 0;
        }

        // If we just completed a lesson, it's also the last accessed one
        enrollment.lastLessonId = updateProgressDto.completedLessonId;
    }

    if (enrollment.progress >= 100) {
      enrollment.progress = 100;
      enrollment.status = EnrollmentStatus.COMPLETED;
      enrollment.completedAt = new Date();
    }

    return this.enrollmentRepository.save(enrollment);
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
