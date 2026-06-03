import { Controller, Post, Get, Param, Body, Query, ParseIntPipe, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AttendanceService } from './attendance.service';
import { ClockInDto } from './dto/clock-in.dto';
import { AttendanceFilterDto } from './dto/attendance-filter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

const photoUploadOptions = {
  storage: memoryStorage(),
  fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
    if (ALLOWED_MIME.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
};

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('clock-in')
  clockIn(@CurrentUser() user: any, @Body() dto: ClockInDto) {
    return this.attendanceService.clockIn(user.id, dto);
  }

  @Post('clock-out')
  clockOut(@CurrentUser() user: any) {
    return this.attendanceService.clockOut(user.id);
  }

  @Post(':id/photo')
  @UseInterceptors(FileInterceptor('photo', photoUploadOptions))
  uploadPhoto(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.attendanceService.uploadPhoto(id, user.id, file);
  }

  @Get('my/today')
  getMyToday(@CurrentUser() user: any) {
    return this.attendanceService.getMyToday(user.id);
  }

  @Get('my')
  getMyHistory(
    @CurrentUser() user: any,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.attendanceService.getMyHistory(user.id, +page, +limit, startDate, endDate);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  findAll(@Query() filter: AttendanceFilterDto) {
    return this.attendanceService.findAll(filter);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.attendanceService.findOneAdmin(id);
  }
}
