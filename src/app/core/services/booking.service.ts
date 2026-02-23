import { apiService } from './api.service';
import type { Booking, CreateBookingPayload } from '../models/booking.model';
import type { ApiResponse, PaginatedResponse } from '../models/api-response.model';

export const bookingService = {
  getBookings(params?: {
    status?: string;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<Booking>> {
    return apiService.get('/v1/bookings', params as Record<string, unknown>);
  },

  getBooking(id: number): Promise<Booking> {
    return apiService.get<ApiResponse<Booking>>(`/v1/bookings/${id}`).then((r) => r.data);
  },

  createBooking(data: CreateBookingPayload): Promise<Booking> {
    return apiService.post<ApiResponse<Booking>>('/v1/bookings', data).then((r) => r.data);
  },

  confirmBooking(bookingId: number): Promise<Booking> {
    return apiService
      .post<ApiResponse<Booking>>(`/v1/bookings/${bookingId}/confirm`)
      .then((r) => r.data);
  },

  cancelBooking(bookingId: number, reason: string): Promise<Booking> {
    return apiService
      .post<ApiResponse<Booking>>(`/v1/bookings/${bookingId}/cancel`, {
        cancellation_reason: reason,
      })
      .then((r) => r.data);
  },

  completeBooking(bookingId: number): Promise<Booking> {
    return apiService
      .post<ApiResponse<Booking>>(`/v1/bookings/${bookingId}/complete`)
      .then((r) => r.data);
  },

  disputeBooking(bookingId: number, reason: string): Promise<Booking> {
    return apiService
      .post<ApiResponse<Booking>>(`/v1/bookings/${bookingId}/dispute`, { reason })
      .then((r) => r.data);
  },

  getUpcomingBookings(): Promise<Booking[]> {
    return apiService
      .get<ApiResponse<Booking[]>>('/v1/bookings/upcoming')
      .then((r) => r.data);
  },

  getBookingHistory(): Promise<PaginatedResponse<Booking>> {
    return apiService.get('/v1/bookings/history');
  },
};
