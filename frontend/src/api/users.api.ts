import axiosInstance from './axiosInstance';
import { User, CreateUserPayload, UpdateUserPayload } from '../types/user.types';
import { PaginatedResponse } from '../types/attendance.types';

export const getUsers = async (params?: { department?: string; page?: number; limit?: number }) => {
  const { data } = await axiosInstance.get<PaginatedResponse<User>>('/users', { params });
  return data;
};

export const createUser = async (payload: CreateUserPayload) => {
  const { data } = await axiosInstance.post<User>('/users', payload);
  return data;
};

export const updateUser = async (id: number, payload: UpdateUserPayload) => {
  const { data } = await axiosInstance.patch<User>(`/users/${id}`, payload);
  return data;
};

export const deleteUser = async (id: number) => {
  await axiosInstance.delete(`/users/${id}`);
};
