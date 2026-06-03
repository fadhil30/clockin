import type { User } from './user.types';

export interface Attendance {
  id: number;
  userId: number;
  date: string;
  clockInAt: string;
  clockOutAt: string | null;
  latitude: number | null;
  longitude: number | null;
  photoUrl: string | null;
  photoUploadedAt: string | null;
  status: string;
  createdAt: string;
  user?: User;
}

export interface ClockInPayload {
  latitude?: number;
  longitude?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
