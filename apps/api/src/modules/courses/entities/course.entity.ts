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
import { User } from '../../users/entities/user.entity';
import { Category } from './category.entity';
import { CourseModule } from './course-module.entity';
import { CourseFile } from './course-file.entity';
import { Enrollment } from '../../enrollment/entities/enrollment.entity';

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum CourseStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  PUBLISHED = 'published',
  UNPUBLISHED = 'unpublished',
  ARCHIVED = 'archived',
}

export enum CourseVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  RESTRICTED = 'restricted',
}

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ length: 500, nullable: true })
  short_description: string;

  @Column('uuid', { nullable: true })
  category_id: string;

  @Column({
    type: 'enum',
    enum: CourseLevel,
    default: CourseLevel.BEGINNER,
  })
  level: CourseLevel;

  @Column({ default: 0 })
  duration_minutes: number;

  @Column({ length: 10, default: 'en' })
  language: string;

  @Column({ nullable: true })
  thumbnail_url: string;

  @Column({ nullable: true })
  trailer_url: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({
    type: 'enum',
    enum: CourseStatus,
    default: CourseStatus.DRAFT,
  })
  status: CourseStatus;

  @Column({
    type: 'enum',
    enum: CourseVisibility,
    default: CourseVisibility.PUBLIC,
  })
  visibility: CourseVisibility;

  @Column({ default: false })
  is_featured: boolean;

  @Column({ nullable: true })
  max_enrollments: number;

  @Column('uuid')
  created_by: string;

  @Column({ nullable: true })
  published_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'created_by' })
  instructor: User;

  @ManyToOne(() => Category, { eager: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => CourseModule, (module) => module.course, { cascade: true })
  modules: CourseModule[];

  @OneToMany(() => CourseFile, (file) => file.course)
  files: CourseFile[];

  @OneToMany(() => Enrollment, (enrollment) => enrollment.course)
  enrollments: Enrollment[];
}