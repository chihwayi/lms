import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('certificate_templates')
export class CertificateTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  background_url: string;

  @Column('jsonb', { default: [] })
  elements: CertificateElement[];

  @Column({ default: false })
  is_default: boolean;

  @Column('uuid')
  created_by: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export interface CertificateElement {
  id: string;
  type: 'text' | 'image' | 'date';
  field: 'student_name' | 'course_title' | 'completion_date' | 'instructor_name' | 'custom_text';
  label: string; // Display label for the element
  x: number; // percentage or pixels
  y: number;
  width?: number;
  fontSize?: number;
  fontColor?: string;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  text?: string; // For custom_text
}
