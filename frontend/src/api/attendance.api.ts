import axiosInstance from './axiosInstance';
import type { Attendance, ClockInPayload, PaginatedResponse } from '../types/attendance.types';

export const clockIn = async (payload: ClockInPayload) => {
  const { data } = await axiosInstance.post<Attendance>('/attendance/clock-in', payload);
  return data;
};

export const clockOut = async () => {
  const { data } = await axiosInstance.post<Attendance>('/attendance/clock-out');
  return data;
};

export const uploadPhoto = async (recordId: number, file: File) => {
  const form = new FormData();
  form.append('photo', file);
  const { data } = await axiosInstance.post<Attendance>(`/attendance/${recordId}/photo`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const getMyToday = async () => {
  const { data } = await axiosInstance.get<Attendance | null>('/attendance/my/today');
  return data;
};

export const getMyHistory = async (params?: { page?: number; limit?: number; startDate?: string; endDate?: string }) => {
  const { data } = await axiosInstance.get<PaginatedResponse<Attendance>>('/attendance/my', { params });
  return data;
};

export const getAllAttendance = async (params?: { date?: string; startDate?: string; endDate?: string; department?: string; userId?: number; page?: number; limit?: number }) => {
  const { data } = await axiosInstance.get<PaginatedResponse<Attendance>>('/attendance', { params });
  return data;
};

export const getAttendanceById = async (id: number) => {
  const { data } = await axiosInstance.get<Attendance>(`/attendance/${id}`);
  return data;
};
