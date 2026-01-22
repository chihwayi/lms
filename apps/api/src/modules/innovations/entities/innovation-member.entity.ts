import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Innovation } from './innovation.entity';
import { User } from '../../users/entities/user.entity';

export enum TeamRole {
  LEADER = 'leader',
  MEMBER = 'member',
  ADVISOR = 'advisor',
}

@Entity('innovation_members')
export class InnovationMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: TeamRole,
    default: TeamRole.MEMBER,
  })
  role: TeamRole;

  @CreateDateColumn()
  joined_at: Date;

  // Relations
  @Column('uuid')
  innovation_id: string;

  @ManyToOne(() => Innovation, (innovation) => innovation.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'innovation_id' })
  innovation: Innovation;

  @Column('uuid')
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
