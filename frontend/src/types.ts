export type Role = 'EMPLOYEE' | 'ADMIN_HRD';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface Attendance {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  attendanceDate: string;
  checkedInAt: string;
  photoPath: string;
  notes: string | null;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}