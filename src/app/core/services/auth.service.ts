import { apiService } from './api.service';
import type { ApiResponse } from '../models/api-response.model';
import type { User } from '../models/user.model';

interface AuthData {
  user: User;
  token: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
  role: 'parent' | 'teacher';
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthData> {
    const res = await apiService.post<ApiResponse<AuthData>>('/v1/auth/login', payload);
    return res.data;
  },

  async register(payload: RegisterPayload): Promise<AuthData> {
    const res = await apiService.post<ApiResponse<AuthData>>('/v1/auth/register', payload);
    return res.data;
  },

  getProfile(): Promise<User> {
    return apiService.get<ApiResponse<User>>('/v1/auth/me').then((r) => r.data);
  },

  logout(): Promise<void> {
    return apiService.post('/v1/auth/logout', {});
  },

  forgotPassword(email: string): Promise<void> {
    return apiService.post('/v1/auth/forgot-password', { email });
  },

  resetPassword(data: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<void> {
    return apiService.post('/v1/auth/reset-password', data);
  },

  updateProfile(data: Partial<User>): Promise<User> {
    return apiService.put<ApiResponse<User>>('/v1/auth/profile', data).then((r) => r.data);
  },

  changePassword(data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<void> {
    return apiService.post('/v1/auth/change-password', data);
  },
};
