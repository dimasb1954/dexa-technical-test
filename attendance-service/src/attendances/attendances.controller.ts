import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthUser } from '../auth/auth-user.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '../auth/role.enum';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AttendancesService } from './attendances.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import { photoUploadOptions } from './upload.config';

@Controller('attendances')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendancesController {
  constructor(private readonly attendances: AttendancesService) {}

  // Karyawan absen & foto bukti WFH
  @Post()
  @Roles(Role.EMPLOYEE)
  @UseInterceptors(FileInterceptor('photo', photoUploadOptions))
  create(
    @Req() req: { user: AuthUser },
    @UploadedFile() photo: Express.Multer.File,
    @Body() dto: CreateAttendanceDto,
  ) {
    return this.attendances.create(req.user, photo, dto);
  }

  // Riwayat absen diri sendiri
  @Get('me')
  @Roles(Role.EMPLOYEE)
  findMine(@Req() req: { user: AuthUser }, @Query() query: QueryAttendanceDto) {
    // employeeId diambil dari token
    return this.attendances.findAll({ ...query, employeeId: req.user.id });
  }

  // Admin HRD, lihat semua absensi (view only) sesuai spek
  @Get()
  @Roles(Role.ADMIN_HRD)
  findAll(@Query() query: QueryAttendanceDto) {
    return this.attendances.findAll(query);
  }
}