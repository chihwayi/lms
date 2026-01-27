import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { CourseModule } from './course-module.entity';
import { CourseFile } from './course-file.entity';

export enum LessonContentType {
  VIDEO = 'video',
  DOCUMENT = 'document',
  TEXT = 'text',
  QUIZ = 'quiz',
  INTERACTIVE = 'interactive',
  SCORM = 'scorm',
}

@Entity('course_lessons')
export class CourseLesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  module_id: string;

  @Column({ length: 255 })
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: LessonContentType,
  })
  content_type: LessonContentType;

  @Column({ nullable: true })
  content_url: string;

  @Column('jsonb', { nullable: true })
  content_data: Record<string, unknown>;

  @Column({ default: 0 })
  duration_minutes: number;

  @Column()
  order_index: number;

  @Column({ default: false })
  is_published: boolean;

  @Column({ default: false })
  is_preview: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => CourseModule, (module) => module.lessons, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'module_id' })
  module: CourseModule;

  @OneToMany(() => CourseFile, (file) => file.lesson)
  files: CourseFile[];
}