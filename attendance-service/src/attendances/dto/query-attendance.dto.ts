import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

export class QueryAttendanceDto {
  @IsOptional()
  @Matches(DATE_FORMAT, { message: 'from must be in YYYY-MM-DD format' })
  from?: string;

  @IsOptional()
  @Matches(DATE_FORMAT, { message: 'to must be in YYYY-MM-DD format' })
  to?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  employeeId?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}