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
  status: 'PRESENT' | 'LATE' | 'LEAVE' | string;
  mode?: 'HOME' | 'OFFICE' | null;
  createdAt: string;
  user?: User;
}

export interface ClockInPayload {
  latitude?: number;
  longitude?: number;
  mode?: 'HOME' | 'OFFICE';
}

export type PresenceStatus = 'in' | 'done' | 'leave' | 'not_in';

export interface PresencePerson {
  employeeId: number;
  name: string;
  role: string | null;
  department: string | null;
  status: PresenceStatus;
  mode: 'HOME' | 'OFFICE' | null;
  since: string | null;
}

export interface PresenceResponse {
  counts: Record<PresenceStatus, number>;
  people: PresencePerson[];
}

export interface MySummary {
  daysPresent: number;
  avgClockIn: string | null;
  hoursLogged: number;
  leaveTaken: number;
}

export interface AdminDashboard {
  presentToday: number;
  totalEmployees: number;
  lateArrivals: number;
  onLeave: number;
  avgClockIn: string | null;
  presence: Record<PresenceStatus, number>;
  recentSubmissions: {
    id: number;
    name: string | null;
    department: string | null;
    mode: 'HOME' | 'OFFICE' | null;
    clockInAt: string;
    status: string;
    photoUrl: string | null;
  }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
