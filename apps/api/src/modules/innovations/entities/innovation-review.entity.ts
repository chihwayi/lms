import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Innovation } from './innovation.entity';

@Entity('innovation_reviews')
export class InnovationReview {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  innovation_id: string;

  @Column('uuid')
  reviewer_id: string;

  @Column('int')
  score: number; // 0-100

  @Column('text', { nullable: true })
  comments: string;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => Innovation, (innovation) => innovation.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'innovation_id' })
  innovation: Innovation;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: User;
}
