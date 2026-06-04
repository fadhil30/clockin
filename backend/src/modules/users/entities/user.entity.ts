import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Role } from '../../../common/enums/role.enum';
import { EmploymentType } from '../../../common/enums/employment-type.enum';
import { UserStatus } from '../../../common/enums/user-status.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 150, unique: true })
  email: string;

  @Column({ name: 'password_hash', length: 255, select: false })
  passwordHash: string;

  @Column({ type: 'enum', enum: Role, default: Role.EMPLOYEE })
  role: Role;

  @Column({ length: 100, nullable: true })
  department: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'job_title', length: 150, nullable: true })
  jobTitle: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ name: 'employment_type', type: 'enum', enum: EmploymentType, nullable: true })
  employmentType: EmploymentType;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ name: 'default_location', length: 150, nullable: true })
  defaultLocation: string;

  @Column({ name: 'joined_at', type: 'date', nullable: true })
  joinedAt: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
