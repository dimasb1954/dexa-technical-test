import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { unlink } from 'fs/promises';
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  Like,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { AuthUser } from '../auth/auth-user.interface';
import { Attendance } from './attendance.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';

// Format YYYY-MM-DD
const todayInJakarta = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

@Injectable()
export class AttendancesService {
  constructor(
    @InjectRepository(Attendance) private readonly repo: Repository<Attendance>,
  ) {}

  async create(
    user: AuthUser,
    photo: Express.Multer.File | undefined,
    dto: CreateAttendanceDto,
  ) {
    if (!photo) {
      throw new BadRequestException('Photo is required (field name: photo)');
    }

    const attendanceDate = todayInJakarta();

    try {
      // Apakah sudah absen
      const exists = await this.repo.findOne({
        where: { employeeId: user.id, attendanceDate },
      });
      if (exists) {
        throw new ConflictException('You have already submitted attendance today');
      }

      return await this.repo.save(
        this.repo.create({
          employeeId: user.id,
          employeeName: user.name,
          employeeEmail: user.email,
          attendanceDate,
          checkedInAt: new Date(),
          photoPath: `/uploads/${photo.filename}`,
          notes: dto.notes ?? null,
        }),
      );
    } catch (err) {
      await unlink(photo.path).catch(() => undefined); // Hapus foto yang sudah terlanjur keupload
      if ((err as { code?: string }).code === 'ER_DUP_ENTRY') {
        throw new ConflictException('You have already submitted attendance today');
      }
      throw err;
    }
  }

  async findAll(query: QueryAttendanceDto) {
    const { from, to, employeeId, name, page = 1, limit = 20 } = query;

    const where: FindOptionsWhere<Attendance> = {};
    if (employeeId) where.employeeId = employeeId;
    if (name) where.employeeName = Like(`%${name}%`);
    if (from && to) where.attendanceDate = Between(from, to);
    else if (from) where.attendanceDate = MoreThanOrEqual(from);
    else if (to) where.attendanceDate = LessThanOrEqual(to);

    const [data, total] = await this.repo.findAndCount({
      where,
      order: { checkedInAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }
}