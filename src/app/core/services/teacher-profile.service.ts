import { apiService } from './api.service';
import type { Teacher, Location } from '../models/teacher.model';
import type { ApiResponse } from '../models/api-response.model';

export const teacherProfileService = {
  // Teacher's own profile management
  getMyProfile(): Promise<Teacher> {
    return apiService.get<ApiResponse<Teacher>>('/v1/teachers/profile/mine').then((r) => r.data);
  },

  updateMyProfile(data: Partial<Teacher>): Promise<Teacher> {
    return apiService
      .put<ApiResponse<Teacher>>('/v1/teachers/profile/mine', data)
      .then((r) => r.data);
  },

  addSubject(data: {
    subject_id: number;
    grade_level_id: number;
    price_override?: number;
  }): Promise<void> {
    return apiService.post('/v1/teachers/profile/mine/subjects', data);
  },

  removeSubject(subjectId: number): Promise<void> {
    return apiService.delete(`/v1/teachers/profile/mine/subjects/${subjectId}`);
  },

  addLocation(data: Omit<Location, 'id' | 'teacher_profile_id'>): Promise<Location> {
    return apiService
      .post<ApiResponse<Location>>('/v1/teachers/profile/mine/locations', data)
      .then((r) => r.data);
  },

  updateLocation(locationId: number, data: Partial<Location>): Promise<Location> {
    return apiService
      .put<ApiResponse<Location>>(`/v1/teachers/profile/mine/locations/${locationId}`, data)
      .then((r) => r.data);
  },

  removeLocation(locationId: number): Promise<void> {
    return apiService.delete(`/v1/teachers/profile/mine/locations/${locationId}`);
  },

  updateAvailability(
    availabilities: Array<{
      day_of_week: number;
      start_time: string;
      end_time: string;
      is_active: boolean;
    }>
  ): Promise<void> {
    return apiService.put('/v1/teachers/profile/mine/availability', { availabilities });
  },

  submitVerification(data: {
    education: string;
    certifications: Array<{
      name: string;
      issuer: string;
      year: number;
      file_url?: string;
    }>;
  }): Promise<void> {
    return apiService.post('/v1/teachers/profile/mine/verification', data);
  },
};
