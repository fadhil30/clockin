import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceRecord } from './entities/attendance.entity';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { SupabaseService } from '../../common/services/supabase.service';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AttendanceRecord, User])],
  providers: [AttendanceService, SupabaseService],
  controllers: [AttendanceController],
})
export class AttendanceModule {}
