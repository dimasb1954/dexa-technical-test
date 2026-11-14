import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Like, Repository } from 'typeorm';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './employee.entity';
import { Role } from './role.enum';

@Injectable()
export class EmployeesService implements OnModuleInit {
  constructor(
    @InjectRepository(Employee) private readonly repo: Repository<Employee>,
    private readonly config: ConfigService,
  ) {}

  // Seed aadmin HRD
  async onModuleInit() {
    const email = this.config.get<string>('ADMIN_EMAIL') ?? 'admin@dexa.test';
    const exists = await this.repo.findOne({ where: { email } });
    if (exists) return;

    const password = await bcrypt.hash(
      this.config.get<string>('ADMIN_PASSWORD') ?? 'Admin123!',
      10,
    );
    await this.repo.save(
      this.repo.create({
        name: 'Admin HRD',
        email,
        password,
        position: 'HR Manager',
        department: 'HRD',
        role: Role.ADMIN_HRD,
      }),
    );
  }

  findByEmailWithPassword(email: string) {
    return this.repo.findOne({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        isActive: true,
      },
    });
  }

  async create(dto: CreateEmployeeDto) {
    const taken = await this.repo.findOne({ where: { email: dto.email } });
    if (taken) throw new ConflictException('Email already registered');

    const saved = await this.repo.save(
      this.repo.create({
        ...dto,
        password: await bcrypt.hash(dto.password, 10),
      }),
    );
    const { password, ...result } = saved;
    return result;
  }

  findAll(search?: string) {
    const where = search
      ? [{ name: Like(`%${search}%`) }, { email: Like(`%${search}%`) }]
      : undefined;
    return this.repo.find({ where, order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const employee = await this.repo.findOne({ where: { id } });
    if (!employee) throw new NotFoundException(`Employee ${id} not found`);
    return employee;
  }

  async update(id: number, dto: UpdateEmployeeDto) {
    await this.findOne(id);

    if (dto.email) {
      const taken = await this.repo.findOne({ where: { email: dto.email } });
      if (taken && taken.id !== id) {
        throw new ConflictException('Email already registered');
      }
    }

    const { password, ...rest } = dto;
    const data: Partial<Employee> = { ...rest };
    if (password) data.password = await bcrypt.hash(password, 10);

    if (Object.keys(data).length > 0) {
      await this.repo.update(id, data);
    }
    return this.findOne(id);
  }

  // Soft delete
  async deactivate(id: number, requesterId: number) {
    if (id === requesterId) {
      throw new BadRequestException('You cannot deactivate your own account');
    }
    await this.findOne(id);
    await this.repo.update(id, { isActive: false });
    return { message: `Employee ${id} deactivated` };
  }
}