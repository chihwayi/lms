import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ActivityType {
  LOGIN = 'login',
  LESSON_COMPLETE = 'lesson_complete',
  QUIZ_ATTEMPT = 'quiz_attempt',
  COURSE_ENROLL = 'course_enroll',
}

@Entity('user_activities')
export class UserActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: ActivityType })
  type: ActivityType;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
