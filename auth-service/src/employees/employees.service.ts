import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Employee } from './employee.entity';
import { Role } from './role.enum';

@Injectable()
export class EmployeesService implements OnModuleInit {
  constructor(
    @InjectRepository(Employee) private readonly repo: Repository<Employee>,
    private readonly config: ConfigService,
  ) {}

  // Membuat akun admin HRD default saat service pertama kali jalan
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

  // Kolom password bersifat select:false, jadi harus diminta eksplisit
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
}