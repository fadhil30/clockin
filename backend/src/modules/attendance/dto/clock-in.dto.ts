import { IsNumber, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

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
}
