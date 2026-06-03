import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class AttendanceFilterDto {
  @IsDateString()
  @IsOptional()
  date?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  userId?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}
