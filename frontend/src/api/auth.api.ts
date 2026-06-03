import axiosInstance from './axiosInstance';
import { User } from '../types/user.types';

export const login = async (email: string, password: string): Promise<{ access_token: string; user: User }> => {
  const { data } = await axiosInstance.post('/auth/login', { email, password });
  return data;
};
