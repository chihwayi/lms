import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CourseLesson } from '../../courses/entities/course-lesson.entity';

export enum SubmissionType {
  DRAWING = 'drawing',
  VOICE = 'voice',
  INTERACTIVE = 'interactive',
}

@Entity('lesson_submissions')
export class LessonSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  lesson_id: string;

  @Column('uuid')
  student_id: string;

  @Column({ nullable: true })
  content_block_id: string;

  @Column({
    type: 'enum',
    enum: SubmissionType,
  })
  submission_type: SubmissionType;

  @Column('text', { nullable: true })
  submission_url: string;

  @Column('jsonb', { nullable: true })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  submission_data: Record<string, any>;

  @Column('int', { nullable: true })
  grade: number;

  @Column('text', { nullable: true })
  feedback: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => CourseLesson, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson: CourseLesson;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: User;
}
