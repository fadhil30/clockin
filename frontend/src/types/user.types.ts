export enum Role {
  EMPLOYEE = 'EMPLOYEE',
  ADMIN = 'ADMIN',
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  department: string | null;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
  department?: string;
}

export interface UpdateUserPayload extends Partial<Omit<CreateUserPayload, 'password'>> {
  password?: string;
}
