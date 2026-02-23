import { apiService } from './api.service';
import type { Teacher, MapMarker, Subject, GradeLevel, TeacherAvailability, TeacherSubject } from '../models/teacher.model';
import type { PaginatedResponse, ApiResponse } from '../models/api-response.model';
import type { Review } from '../models/payment.model';

interface SearchParams {
  lat: number;
  lng: number;
  radius?: number;
  subject_id?: number | null;
  grade_level_id?: number | null;
  min_rating?: number | null;
  max_price?: number | null;
  accepts_online?: boolean | null;
  page?: number;
  per_page?: number;
}

interface SearchResponse {
  success: boolean;
  data: Teacher[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
    search_radius_km: number;
  };
}

export const teacherSearchService = {
  searchNearby(params: SearchParams): Promise<SearchResponse> {
    return apiService.get<SearchResponse>('/v1/teachers/nearby', params as unknown as Record<string, unknown>);
  },

  getMapMarkers(
    params: Pick<SearchParams, 'lat' | 'lng' | 'radius' | 'subject_id'>
  ): Promise<MapMarker[]> {
    return apiService
      .get<{ data: MapMarker[] }>('/v1/teachers/map-markers', params as unknown as Record<string, unknown>)
      .then((r) => r.data);
  },

  getTeacherProfile(id: number): Promise<Teacher> {
    return apiService.get<ApiResponse<Teacher>>(`/v1/teachers/${id}`).then((r) => r.data);
  },

  getTeacherReviews(teacherId: number, page = 1): Promise<PaginatedResponse<Review>> {
    return apiService.get(`/v1/teachers/${teacherId}/reviews`, { page });
  },

  getTeacherAvailability(teacherId: number): Promise<TeacherAvailability[]> {
    return apiService.get<ApiResponse<TeacherAvailability[]>>(`/v1/teachers/${teacherId}/availability`).then((r) => r.data);
  },

  getTeacherSubjects(teacherId: number): Promise<TeacherSubject[]> {
    return apiService.get<ApiResponse<TeacherSubject[]>>(`/v1/teachers/${teacherId}/subjects`).then((r) => r.data);
  },

  getSubjects(): Promise<Subject[]> {
    return apiService.get<ApiResponse<Subject[]>>('/v1/teachers/subjects').then((r) => r.data);
  },

  getGradeLevels(): Promise<GradeLevel[]> {
    return apiService
      .get<ApiResponse<GradeLevel[]>>('/v1/teachers/grade-levels')
      .then((r) => r.data);
  },
};
