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

export interface RefreshResponse {
  success: boolean;
  user: User;
}

export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    return response.data.user;
  } catch (error: any) {
    const errorMessage = error.msg || error.message || 'Login failed';
    throw new Error(errorMessage);
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await api.get<User>('/auth/me');
    return response.data;
  } catch (error: any) {
    // If 401 or 403, it means user is not authenticated - don't treat as error
    if (error.status === 401 || error.status === 403) {
      return null;
    }
    const errorMessage = error.msg || error.message || 'Failed to get user data';
    throw new Error(errorMessage);
  }
};

export const refreshToken = async (): Promise<User> => {
  try {
    const response = await api.post<RefreshResponse>('/auth/refresh');
    return response.data.user;
  } catch (error: any) {
    const errorMessage = error.msg || error.message || 'Failed to refresh token';
    throw new Error(errorMessage);
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } catch (error: any) {
    const errorMessage = error.msg || error.message || 'Logout failed';
    throw new Error(errorMessage);
  }
};