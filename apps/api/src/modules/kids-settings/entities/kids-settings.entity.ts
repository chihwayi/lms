import { Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('kids_settings')
@Unique(['user_id'])
export class KidsSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column({ default: true })
  screen_time_limit: boolean;

  @Column({ default: false })
  background_music: boolean;

  @Column({ default: true })
  sound_effects: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
