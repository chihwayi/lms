import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { MentorProfile } from './mentor-profile.entity';

export enum MentorshipRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

@Entity('mentorship_requests')
export class MentorshipRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'mentor_id' })
  mentorId: string;

  @ManyToOne(() => MentorProfile)
  @JoinColumn({ name: 'mentor_id' })
  mentor: MentorProfile;

  @Column({ name: 'mentee_id' })
  menteeId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'mentee_id' })
  mentee: User;

  @Column({
    type: 'enum',
    enum: MentorshipRequestStatus,
    default: MentorshipRequestStatus.PENDING,
  })
  status: MentorshipRequestStatus;

  @Column('text')
  message: string;

  @Column('text', { name: 'response_message', nullable: true })
  responseMessage: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
