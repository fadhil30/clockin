import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceRecord } from './entities/attendance.entity';
import { ClockInDto } from './dto/clock-in.dto';
import { AttendanceFilterDto } from './dto/attendance-filter.dto';
import { SupabaseService } from '../../common/services/supabase.service';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceRecord)
    private readonly attendanceRepo: Repository<AttendanceRecord>,
    private readonly supabaseService: SupabaseService,
  ) {}

  private todayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  async clockIn(userId: number, dto: ClockInDto): Promise<AttendanceRecord> {
    const today = this.todayString();
    const existing = await this.attendanceRepo.findOne({ where: { userId, date: today } });
    if (existing) throw new ConflictException('Already clocked in today');

    const record = this.attendanceRepo.create({
      userId,
      date: today,
      clockInAt: new Date(),
      latitude: dto.latitude ?? undefined,
      longitude: dto.longitude ?? undefined,
      status: 'PRESENT',
    } as Partial<AttendanceRecord>);
    return this.attendanceRepo.save(record as AttendanceRecord);
  }

  async clockOut(userId: number): Promise<AttendanceRecord> {
    const today = this.todayString();
    const record = await this.attendanceRepo.findOne({ where: { userId, date: today } });
    if (!record) throw new NotFoundException('No clock-in record found for today');
    if (record.clockOutAt) throw new ConflictException('Already clocked out today');

    record.clockOutAt = new Date();
    return this.attendanceRepo.save(record);
  }

  async uploadPhoto(recordId: number, userId: number, file: Express.Multer.File): Promise<AttendanceRecord> {
    const record = await this.attendanceRepo.findOne({ where: { id: recordId } });
    if (!record) throw new NotFoundException(`Record #${recordId} not found`);
    if (record.userId !== userId) throw new ForbiddenException('Cannot modify another employee\'s record');
    if (record.photoUrl) throw new ConflictException('Proof photo already submitted and cannot be changed');

    const photoUrl = await this.supabaseService.uploadFile(file);
    record.photoUrl = photoUrl;
    record.photoUploadedAt = new Date();
    return this.attendanceRepo.save(record);
  }

  async getMyToday(userId: number): Promise<AttendanceRecord | null> {
    return this.attendanceRepo.findOne({ where: { userId, date: this.todayString() } });
  }

  async getMyHistory(userId: number, page = 1, limit = 10, startDate?: string, endDate?: string) {
    const qb = this.attendanceRepo.createQueryBuilder('a')
      .where('a.userId = :userId', { userId });

    if (startDate) qb.andWhere('a.date >= :startDate', { startDate });
    if (endDate) qb.andWhere('a.date <= :endDate', { endDate });

    const [data, total] = await qb
      .orderBy('a.date', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findAll(filter: AttendanceFilterDto) {
    const { date, startDate, endDate, department, userId, page = 1, limit = 20 } = filter;

    const qb = this.attendanceRepo.createQueryBuilder('a')
      .leftJoinAndSelect('a.user', 'user');

    if (date) qb.andWhere('a.date = :date', { date });
    if (startDate) qb.andWhere('a.date >= :startDate', { startDate });
    if (endDate) qb.andWhere('a.date <= :endDate', { endDate });
    if (userId) qb.andWhere('a.userId = :userId', { userId });
    if (department) qb.andWhere('user.department = :department', { department });

    const [data, total] = await qb
      .orderBy('a.date', 'DESC')
      .addOrderBy('a.clockInAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOneAdmin(id: number): Promise<AttendanceRecord> {
    const record = await this.attendanceRepo.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!record) throw new NotFoundException(`Record #${id} not found`);
    return record;
  }
}
