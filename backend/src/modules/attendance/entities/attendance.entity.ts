import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { WorkMode } from '../../../common/enums/work-mode.enum';
import { AttendanceStatus } from '../../../common/enums/attendance-status.enum';

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

  @Column({ type: 'enum', enum: AttendanceStatus, default: AttendanceStatus.PRESENT })
  status: AttendanceStatus;

  @Column({ type: 'enum', enum: WorkMode, default: WorkMode.HOME })
  mode: WorkMode;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  toJSON() {
    const r = this as any;
    return {
      id: r.id,
      userId: r.userId ?? r.user_id,
      date: r.date,
      clockInAt: r.clockInAt ?? r.clock_in_at ?? null,
      clockOutAt: r.clockOutAt ?? r.clock_out_at ?? null,
      latitude: r.latitude ?? null,
      longitude: r.longitude ?? null,
      photoUrl: r.photoUrl ?? r.photo_url ?? null,
      photoUploadedAt: r.photoUploadedAt ?? r.photo_uploaded_at ?? null,
      status: r.status,
      mode: r.mode,
      createdAt: r.createdAt ?? r.created_at,
      user: r.user,
    };
  }
}
