import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceRecord } from './entities/attendance.entity';
import { ClockInDto } from './dto/clock-in.dto';
import { AttendanceFilterDto } from './dto/attendance-filter.dto';
import { SupabaseService } from '../../common/services/supabase.service';
import { WorkMode } from '../../common/enums/work-mode.enum';
import { AttendanceStatus } from '../../common/enums/attendance-status.enum';
import { User } from '../users/entities/user.entity';
import { Role } from '../../common/enums/role.enum';

// WIB = UTC+7. Default cutoff: 09:15. Override via LATE_THRESHOLD_WIB env var (format HH:MM).
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceRecord)
    private readonly attendanceRepo: Repository<AttendanceRecord>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly supabaseService: SupabaseService,
  ) {}

  private todayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  private resolveStatus(clockInAt: Date): AttendanceStatus {
    const [cutH, cutM] = (process.env.LATE_THRESHOLD_WIB ?? '09:15').split(':').map(Number);
    const wib = new Date(clockInAt.getTime() + WIB_OFFSET_MS);
    const h = wib.getUTCHours();
    const m = wib.getUTCMinutes();
    return h > cutH || (h === cutH && m > cutM) ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;
  }

  private formatAvgTime(dates: Date[]): string {
    const avgSec = dates.reduce((s, d) => s + d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds(), 0) / dates.length;
    const h = Math.floor(avgSec / 3600);
    const m = Math.floor((avgSec % 3600) / 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  async clockIn(userId: number, dto: ClockInDto): Promise<AttendanceRecord> {
    const today = this.todayString();
    const existing = await this.attendanceRepo.findOne({ where: { userId, date: today } });
    if (existing) throw new ConflictException('Already clocked in today');

    const now = new Date();
    const record = this.attendanceRepo.create({
      userId,
      date: today,
      clockInAt: now,
      latitude: dto.latitude ?? undefined,
      longitude: dto.longitude ?? undefined,
      mode: dto.mode ?? WorkMode.HOME,
      status: this.resolveStatus(now),
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

  async getMySummary(userId: number, from?: string, to?: string) {
    const qb = this.attendanceRepo.createQueryBuilder('a')
      .where('a.userId = :userId', { userId });

    if (from) qb.andWhere('a.date >= :from', { from });
    if (to) qb.andWhere('a.date <= :to', { to });

    const records = await qb.getMany();

    const daysPresent = records.filter((r) => r.status !== AttendanceStatus.LEAVE).length;
    const leaveTaken = records.filter((r) => r.status === AttendanceStatus.LEAVE).length;

    const completed = records.filter((r) => r.clockInAt && r.clockOutAt);
    const hoursLogged = Math.round(
      completed.reduce((s, r) => {
        const diff = (new Date(r.clockOutAt).getTime() - new Date(r.clockInAt).getTime()) / 3_600_000;
        return s + diff;
      }, 0),
    );

    const presents = records.filter((r) => r.clockInAt && r.status !== AttendanceStatus.LEAVE);
    const avgClockIn = presents.length
      ? this.formatAvgTime(presents.map((r) => new Date(r.clockInAt)))
      : null;

    return { daysPresent, avgClockIn, hoursLogged, leaveTaken };
  }

  async getPresenceToday() {
    const today = this.todayString();

    const employees = await this.userRepo.find({
      where: { isActive: true, role: Role.EMPLOYEE },
    });

    const records = await this.attendanceRepo.find({ where: { date: today } });
    const byUser = new Map(records.map((r) => [r.userId, r]));

    const people = employees.map((e) => {
      const r = byUser.get(e.id);
      let status: 'in' | 'done' | 'leave' | 'not_in' = 'not_in';
      if (r?.status === AttendanceStatus.LEAVE) status = 'leave';
      else if (r && r.clockOutAt) status = 'done';
      else if (r) status = 'in';
      return {
        employeeId: e.id,
        name: e.name,
        role: e.jobTitle ?? null,
        department: e.department ?? null,
        status,
        mode: r?.mode ?? null,
        since: r ? r.clockInAt : null,
      };
    });

    const counts = people.reduce(
      (acc, p) => { acc[p.status]++; return acc; },
      { in: 0, done: 0, leave: 0, not_in: 0 } as Record<string, number>,
    );

    return { counts, people };
  }

  async getAdminDashboard() {
    const today = this.todayString();

    const totalEmployees = await this.userRepo.count({
      where: { isActive: true, role: Role.EMPLOYEE },
    });

    const todays = await this.attendanceRepo.find({
      where: { date: today },
      relations: { user: true },
      order: { clockInAt: 'DESC' },
    });

    const presentToday = todays.length;
    const lateArrivals = todays.filter((r) => r.status === AttendanceStatus.LATE).length;
    const onLeave = todays.filter((r) => r.status === AttendanceStatus.LEAVE).length;

    const presents = todays.filter((r) => r.status !== AttendanceStatus.LEAVE && r.clockInAt);
    const avgClockIn = presents.length
      ? this.formatAvgTime(presents.map((r) => new Date(r.clockInAt)))
      : null;

    const recentSubmissions = todays.slice(0, 8).map((r) => ({
      id: r.id,
      name: r.user?.name ?? null,
      department: r.user?.department ?? null,
      mode: r.mode ?? null,
      clockInAt: r.clockInAt,
      status: r.status,
      photoUrl: r.photoUrl ?? null,
    }));

    const presence = await this.getPresenceToday();

    return {
      presentToday,
      totalEmployees,
      lateArrivals,
      onLeave,
      avgClockIn,
      presence: presence.counts,
      recentSubmissions,
    };
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
