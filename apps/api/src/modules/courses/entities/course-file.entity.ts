import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { CourseLesson } from './course-lesson.entity';
import { User } from '../../users/entities/user.entity';

@Entity('course_files')
export class CourseFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  course_id: string;

  @Column('uuid', { nullable: true })
  lesson_id: string;

  @Column({ length: 255, nullable: true })
  original_name: string;

  @Column({ length: 255, nullable: true })
  file_name: string;

  @Column({ nullable: true })
  file_path: string;

  @Column('bigint', { nullable: true })
  file_size: number;

  @Column({ length: 100, nullable: true })
  mime_type: string;

  @Column({ length: 50, nullable: true })
  file_type: string;

  @Column({ length: 50, default: 'pending' })
  processing_status: string;

  @Column('uuid', { nullable: true })
  uploaded_by: string;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => Course, (course) => course.files, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToOne(() => CourseLesson, (lesson) => lesson.files, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson: CourseLesson;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'uploaded_by' })
  uploader: User;
}