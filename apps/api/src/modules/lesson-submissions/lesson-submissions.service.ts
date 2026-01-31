import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonSubmission, SubmissionType } from './entities/lesson-submission.entity';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { User } from '../users/entities/user.entity';
import { GamificationService } from '../gamification/gamification.service';

@Injectable()
export class LessonSubmissionsService {
  constructor(
    @InjectRepository(LessonSubmission)
    private submissionsRepository: Repository<LessonSubmission>,
    private gamificationService: GamificationService,
  ) {}

  async create(user: User, createSubmissionDto: CreateSubmissionDto): Promise<LessonSubmission> {
    const submission = this.submissionsRepository.create({
      student_id: user.id,
      lesson_id: createSubmissionDto.lessonId,
      content_block_id: createSubmissionDto.contentBlockId,
      submission_type: createSubmissionDto.submissionType,
      submission_url: createSubmissionDto.submissionUrl,
      submission_data: createSubmissionDto.submissionData,
      grade: createSubmissionDto.submissionData?.score,
    });

    const savedSubmission = await this.submissionsRepository.save(submission);

    // Gamification Triggers for Interactive Activities
    if (
      savedSubmission.submission_type === SubmissionType.INTERACTIVE &&
      savedSubmission.grade &&
      savedSubmission.grade >= 80
    ) {
      await this.gamificationService.awardXP(
        user.id,
        20,
        'completed_interactive_activity',
        savedSubmission.id,
      );
      // Award a random sticker for passing
      await this.gamificationService.awardSticker(user.id);
    }

    return savedSubmission;
  }

  async findAllByStudent(studentId: string, lessonId?: string): Promise<LessonSubmission[]> {
    const query = this.submissionsRepository.createQueryBuilder('submission')
      .where('submission.student_id = :studentId', { studentId })
      .leftJoinAndSelect('submission.lesson', 'lesson')
      .orderBy('submission.created_at', 'DESC');

    if (lessonId) {
      query.andWhere('submission.lesson_id = :lessonId', { lessonId });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<LessonSubmission> {
    return this.submissionsRepository.findOne({
      where: { id },
      relations: ['student', 'lesson'],
    });
  }

  async findAll(filters: { lessonId?: string; studentId?: string; courseId?: string; limit?: number }): Promise<LessonSubmission[]> {
    const query = this.submissionsRepository.createQueryBuilder('submission')
      .leftJoinAndSelect('submission.student', 'student')
      .leftJoinAndSelect('submission.lesson', 'lesson')
      .orderBy('submission.created_at', 'DESC');

    if (filters.lessonId) {
      query.andWhere('submission.lesson_id = :lessonId', { lessonId: filters.lessonId });
    }
    
    if (filters.studentId) {
      query.andWhere('submission.student_id = :studentId', { studentId: filters.studentId });
    }

    if (filters.courseId) {
      query.innerJoin('lesson.module', 'module')
           .innerJoin('module.course', 'course')
           .andWhere('course.id = :courseId', { courseId: filters.courseId });
    }

    if (filters.limit) {
      query.take(filters.limit);
    }

    return query.getMany();
  }
}
