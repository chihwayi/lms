import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { InnovationReview } from './innovation-review.entity';
import { InnovationMilestone } from './innovation-milestone.entity';
import { InnovationMember } from './innovation-member.entity';
import { InnovationComment } from './innovation-comment.entity';

export enum InnovationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('innovations')
export class Innovation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column('text')
  problem_statement: string;

  @Column('text')
  solution_description: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  budget_estimate: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  allocated_budget: number;

  @Column({
    type: 'enum',
    enum: InnovationStatus,
    default: InnovationStatus.DRAFT,
  })
  status: InnovationStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @Column('uuid')
  student_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: User;

  @OneToMany(() => InnovationReview, (review) => review.innovation)
  reviews: InnovationReview[];

  @OneToMany(() => InnovationMilestone, (milestone) => milestone.innovation)
  milestones: InnovationMilestone[];

  @OneToMany(() => InnovationMember, (member) => member.innovation)
  members: InnovationMember[];

  @OneToMany(() => InnovationComment, (comment) => comment.innovation)
  comments: InnovationComment[];
}
