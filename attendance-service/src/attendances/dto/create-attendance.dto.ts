import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAttendanceDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  notes?: string;
}