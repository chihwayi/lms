import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonSubmission } from './entities/lesson-submission.entity';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class LessonSubmissionsService {
  constructor(
    @InjectRepository(LessonSubmission)
    private submissionsRepository: Repository<LessonSubmission>,
  ) {}

  async create(user: User, createSubmissionDto: CreateSubmissionDto): Promise<LessonSubmission> {
    const submission = this.submissionsRepository.create({
      student_id: user.id,
      lesson_id: createSubmissionDto.lessonId,
      content_block_id: createSubmissionDto.contentBlockId,
      submission_type: createSubmissionDto.submissionType,
      submission_url: createSubmissionDto.submissionUrl,
    });

    return this.submissionsRepository.save(submission);
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
}
