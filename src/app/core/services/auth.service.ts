import { apiService } from './api.service';
import type { User } from '../models/user.model';

interface AuthResponse {
  user: User;
  token: string;
  token_type: string;
  expires_in: number;
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
  login(payload: LoginPayload): Promise<AuthResponse> {
    return apiService.post('/v1/auth/login', payload);
  },

  register(payload: RegisterPayload): Promise<AuthResponse> {
    return apiService.post('/v1/auth/register', payload);
  },

  getProfile(): Promise<User> {
    return apiService.get<{ data: User }>('/v1/auth/me').then((r) => r.data);
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
    return apiService.put<{ data: User }>('/v1/auth/profile', data).then((r) => r.data);
  },

  changePassword(data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<void> {
    return apiService.post('/v1/auth/change-password', data);
  },
};
