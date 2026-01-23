import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('mentor_profiles')
export class MentorProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  title: string;

  @Column()
  company: string;

  @Column('text')
  bio: string;

  @Column('text', { array: true, default: [] })
  expertise: string[];

  @Column({ name: 'years_of_experience', default: 0 })
  yearsOfExperience: number;

  @Column({ name: 'linkedin_url', nullable: true })
  linkedinUrl: string;

  @Column({ name: 'website_url', nullable: true })
  websiteUrl: string;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @Column({ name: 'max_mentees', default: 5 })
  maxMentees: number;

  @Column({ type: 'jsonb', nullable: true })
  availability: {
    dayOfWeek: number; // 0-6
    startTime: string; // HH:mm
    endTime: string;   // HH:mm
  }[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
