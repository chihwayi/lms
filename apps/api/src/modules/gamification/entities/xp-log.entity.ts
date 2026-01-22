import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('xp_logs')
export class XPLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  amount: number;

  @Column()
  action: string; // e.g., 'lesson_completed', 'innovation_submitted'

  @Column({ nullable: true })
  entity_id: string; // ID of the related entity (lessonId, innovationId)

  @CreateDateColumn()
  created_at: Date;
}
