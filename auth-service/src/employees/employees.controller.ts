import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeesService } from './employees.service';
import { Role } from './role.enum';

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN_HRD)
export class EmployeesController {
  constructor(private readonly employees: EmployeesService) {}

  @Post()
  create(@Body() dto: CreateEmployeeDto) {
    return this.employees.create(dto);
  }

  @Get()
  findAll(@Query('search') search?: string) {
    return this.employees.findAll(search);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.employees.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmployeeDto,
  ) {
    return this.employees.update(id, dto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { id: number } },
  ) {
    return this.employees.deactivate(id, req.user.id);
  }
}