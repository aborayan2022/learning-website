import { apiService } from './api.service';
import type { ApiResponse, PaginatedResponse } from '../models/api-response.model';
import type { User } from '../models/user.model';

interface DashboardStats {
  total_users: number;
  total_teachers: number;
  total_parents: number;
  total_bookings: number;
  total_revenue: number;
  pending_verifications: number;
  active_subscriptions: number;
}

interface ChartData {
  revenue_chart: Array<{ date: string; amount: number }>;
  bookings_chart: Array<{ date: string; count: number }>;
  users_chart: Array<{ date: string; count: number }>;
}

interface FinancialReport {
  period: { from: string; to: string };
  total_revenue: number;
  total_commissions: number;
  total_payouts: number;
  subscription_revenue: number;
  featured_revenue: number;
}

export const adminService = {
  // Dashboard
  getStats(): Promise<DashboardStats> {
    return apiService
      .get<ApiResponse<DashboardStats>>('/v1/admin/dashboard/stats')
      .then((r) => r.data);
  },

  getCharts(period: string = 'month'): Promise<ChartData> {
    return apiService
      .get<ApiResponse<ChartData>>('/v1/admin/dashboard/charts', { period })
      .then((r) => r.data);
  },

  // User Management
  getUsers(params?: {
    role?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<User>> {
    return apiService.get('/v1/admin/users', params as Record<string, unknown>);
  },

  getUser(userId: number): Promise<User> {
    return apiService.get<ApiResponse<User>>(`/v1/admin/users/${userId}`).then((r) => r.data);
  },

  updateUser(userId: number, data: Partial<User>): Promise<User> {
    return apiService
      .put<ApiResponse<User>>(`/v1/admin/users/${userId}`, data)
      .then((r) => r.data);
  },

  toggleUserActive(userId: number): Promise<User> {
    return apiService
      .post<ApiResponse<User>>(`/v1/admin/users/${userId}/toggle-active`)
      .then((r) => r.data);
  },

  // Teacher Verification
  getPendingVerifications(page?: number): Promise<PaginatedResponse<unknown>> {
    return apiService.get('/v1/admin/verifications/pending', { page });
  },

  approveVerification(teacherProfileId: number): Promise<void> {
    return apiService.post(`/v1/admin/verifications/${teacherProfileId}/approve`);
  },

  rejectVerification(teacherProfileId: number, reason: string): Promise<void> {
    return apiService.post(`/v1/admin/verifications/${teacherProfileId}/reject`, { reason });
  },

  // Financial Reports
  getRevenueReport(params?: { from?: string; to?: string }): Promise<FinancialReport> {
    return apiService
      .get<ApiResponse<FinancialReport>>('/v1/admin/reports/revenue', params as Record<string, unknown>)
      .then((r) => r.data);
  },

  getCommissionsReport(params?: {
    from?: string;
    to?: string;
    page?: number;
  }): Promise<PaginatedResponse<unknown>> {
    return apiService.get('/v1/admin/reports/commissions', params as Record<string, unknown>);
  },

  getPayoutsReport(params?: {
    from?: string;
    to?: string;
    page?: number;
  }): Promise<PaginatedResponse<unknown>> {
    return apiService.get('/v1/admin/reports/payouts', params as Record<string, unknown>);
  },

  exportReport(params: { type: string; from?: string; to?: string; format?: string }): Promise<Blob> {
    return apiService.get('/v1/admin/reports/export', params as Record<string, unknown>);
  },
};
