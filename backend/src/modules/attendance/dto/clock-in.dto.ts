import { IsEnum, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { WorkMode } from '../../../common/enums/work-mode.enum';

export class ClockInDto {
  @IsNumber()
  @IsOptional()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  latitude?: number;

  @IsNumber()
  @IsOptional()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  longitude?: number;

  @IsEnum(WorkMode)
  @IsOptional()
  mode?: WorkMode;
}
