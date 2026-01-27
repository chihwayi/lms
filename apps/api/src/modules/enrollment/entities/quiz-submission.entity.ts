import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Enrollment } from './enrollment.entity';
import { CourseLesson } from '../../courses/entities/course-lesson.entity';

@Entity('quiz_submissions')
export class QuizSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  enrollment_id: string;

  @ManyToOne(() => Enrollment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'enrollment_id' })
  enrollment: Enrollment;

  @Column('uuid')
  lesson_id: string;

  @ManyToOne(() => CourseLesson, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson: CourseLesson;

  @Column('jsonb')
  answers: Record<string, string>; // { questionId: answerValue }

  @Column('float')
  score: number; // Percentage 0-100

  @Column()
  passed: boolean;

  @CreateDateColumn()
  created_at: Date;
}
