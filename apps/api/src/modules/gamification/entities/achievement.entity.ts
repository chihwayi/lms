import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AchievementType {
  COURSE = 'course',
  INNOVATION = 'innovation',
  COMMUNITY = 'community',
  STREAK = 'streak',
}

@Entity('achievements')
export class Achievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string; // e.g., 'first-course-completed'

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  icon_url: string; // Could be a lucide icon name or image URL

  @Column({
    type: 'enum',
    enum: AchievementType,
    default: AchievementType.COURSE,
  })
  type: AchievementType;

  @Column({ default: 0 })
  xp_reward: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
