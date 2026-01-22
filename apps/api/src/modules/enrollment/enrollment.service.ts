import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Enrollment, EnrollmentStatus } from './entities/enrollment.entity';
import { Course } from '../courses/entities/course.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';

@Injectable()
export class EnrollmentService implements OnModuleInit {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
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
    });

    return this.enrollmentRepository.save(enrollment);
  }

  async checkEnrollment(userId: string, courseId: string): Promise<{ isEnrolled: boolean; enrollment?: Enrollment }> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { userId, courseId },
    });

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

    enrollment.progress = updateProgressDto.progress;

    if (updateProgressDto.completedLessonId) {
        if (!enrollment.completedLessons) {
            enrollment.completedLessons = [];
        }
        if (!enrollment.completedLessons.includes(updateProgressDto.completedLessonId)) {
            enrollment.completedLessons.push(updateProgressDto.completedLessonId);
        }
    }

    if (enrollment.progress === 100) {
      enrollment.status = EnrollmentStatus.COMPLETED;
      enrollment.completedAt = new Date();
    }

    return this.enrollmentRepository.save(enrollment);
  }

  async getMyCourses(userId: string): Promise<Enrollment[]> {
    return this.enrollmentRepository.find({
      where: { userId },
      relations: ['course'],
      order: { enrolledAt: 'DESC' },
    });
  }
}
