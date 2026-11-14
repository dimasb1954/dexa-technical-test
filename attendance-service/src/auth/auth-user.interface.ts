import { Role } from './role.enum';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: Role;
}