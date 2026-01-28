import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Sticker } from './sticker.entity';

@Entity('user_stickers')
export class UserSticker {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column('uuid')
  sticker_id: string;

  @CreateDateColumn()
  earned_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Sticker)
  @JoinColumn({ name: 'sticker_id' })
  sticker: Sticker;
}
