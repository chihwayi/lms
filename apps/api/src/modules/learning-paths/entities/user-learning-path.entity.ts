import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { LearningPath } from './learning-path.entity';

export enum LearningPathStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Entity('user_learning_paths')
export class UserLearningPath {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => LearningPath, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'learning_path_id' })
  learningPath: LearningPath;

  @Column({ name: 'learning_path_id' })
  learningPathId: string;

  @Column({ type: 'float', default: 0 })
  progress: number;

  @Column({ type: 'enum', enum: LearningPathStatus, default: LearningPathStatus.IN_PROGRESS })
  status: LearningPathStatus;

  @CreateDateColumn({ name: 'enrolled_at' })
  enrolledAt: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;
}
