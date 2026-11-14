import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('attendances')
@Unique(['employeeId', 'attendanceDate'])
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  employeeId: number;

  @Column({ length: 100 })
  employeeName: string;

  @Column({ length: 150 })
  employeeEmail: string;

  @Column({ type: 'date' })
  attendanceDate: string; // formatnya YYYY-MM-DD

  @Column({ type: 'datetime' })
  checkedInAt: Date;

  @Column({ length: 255 })
  photoPath: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;
}