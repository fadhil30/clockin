export enum Role {
  EMPLOYEE = 'EMPLOYEE',
  ADMIN = 'ADMIN',
}

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT';
export type UserStatus = 'ACTIVE' | 'INVITED' | 'SUSPENDED';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  department: string | null;
  jobTitle?: string | null;
  phone?: string | null;
  employmentType?: EmploymentType | null;
  status?: UserStatus | null;
  defaultLocation?: string | null;
  joinedAt?: string | null;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
  department?: string;
  jobTitle?: string;
  phone?: string;
  employmentType?: EmploymentType;
  status?: UserStatus;
  defaultLocation?: string;
  joinedAt?: string;
}

export interface UpdateUserPayload extends Partial<Omit<CreateUserPayload, 'password'>> {
  password?: string;
}
