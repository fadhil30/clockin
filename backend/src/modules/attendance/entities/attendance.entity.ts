import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('attendance_records')
@Index(['userId', 'date'], { unique: true })
export class AttendanceRecord {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ name: 'user_id', unsigned: true })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'RESTRICT', eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'date' })
  date: string;

  @Column({ name: 'clock_in_at', type: 'datetime' })
  clockInAt: Date;

  @Column({ name: 'clock_out_at', type: 'datetime', nullable: true })
  clockOutAt: Date;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 7, nullable: true })
  longitude: number;

  @Column({ name: 'photo_url', length: 1000, nullable: true })
  photoUrl: string;

  @Column({ name: 'photo_uploaded_at', type: 'datetime', nullable: true })
  photoUploadedAt: Date;

  @Column({ default: 'PRESENT' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
