import api from './axios';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'employer' | 'manager';
  createdAt: string;
}

export interface LoginResponse {
  user: User;
}

export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    return response.data.user;
  } catch (error: any) {
    throw new Error(error.msg || 'Login failed');
  }
};

export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await api.get<User>('/auth/me');
    return response.data;
  } catch (error: any) {
    throw new Error(error.msg || 'Failed to get user data');
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } catch (error: any) {
    throw new Error(error.msg || 'Logout failed');
  }
};