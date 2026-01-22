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
import { Innovation } from './innovation.entity';

@Entity('innovation_comments')
export class InnovationComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @Column('uuid')
  innovation_id: string;

  @ManyToOne(() => Innovation, (innovation) => innovation.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'innovation_id' })
  innovation: Innovation;

  @Column('uuid')
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('uuid', { nullable: true })
  parent_id: string;

  @ManyToOne(() => InnovationComment, (comment) => comment.children, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'parent_id' })
  parent: InnovationComment;

  @OneToMany(() => InnovationComment, (comment) => comment.parent)
  children: InnovationComment[];
}
