import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Attendance } from './attendance.entity';
import { AttendancesController } from './attendances.controller';
import { AttendancesService } from './attendances.service';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance]), AuthModule],
  controllers: [AttendancesController],
  providers: [AttendancesService],
})
export class AttendancesModule {}