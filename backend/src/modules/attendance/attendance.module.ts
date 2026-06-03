import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceRecord } from './entities/attendance.entity';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { SupabaseService } from '../../common/services/supabase.service';

@Module({
  imports: [TypeOrmModule.forFeature([AttendanceRecord])],
  providers: [AttendanceService, SupabaseService],
  controllers: [AttendanceController],
})
export class AttendanceModule {}
