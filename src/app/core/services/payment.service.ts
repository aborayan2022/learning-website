import { apiService } from './api.service';
import type { Payment, PaymentInitiation, Review, CreateReviewPayload } from '../models/payment.model';
import type { ApiResponse, PaginatedResponse } from '../models/api-response.model';

export const paymentService = {
  initiatePayment(
    bookingId: number,
    gateway: string = 'paymob'
  ): Promise<PaymentInitiation> {
    return apiService
      .post<ApiResponse<PaymentInitiation>>('/v1/payments/initiate', {
        booking_id: bookingId,
        gateway,
      })
      .then((r) => r.data);
  },

  getPaymentStatus(paymentId: number): Promise<Payment> {
    return apiService
      .get<ApiResponse<Payment>>(`/v1/payments/status/${paymentId}`)
      .then((r) => r.data);
  },

  getPaymentHistory(params?: {
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<Payment>> {
    return apiService.get('/v1/payments/history', params as Record<string, unknown>);
  },

  requestRefund(paymentId: number, reason: string): Promise<Payment> {
    return apiService
      .post<ApiResponse<Payment>>(`/v1/payments/${paymentId}/refund`, { reason })
      .then((r) => r.data);
  },
};

export const reviewService = {
  createReview(data: CreateReviewPayload): Promise<Review> {
    return apiService.post<ApiResponse<Review>>('/v1/reviews', data).then((r) => r.data);
  },

  updateReview(reviewId: number, data: Partial<CreateReviewPayload>): Promise<Review> {
    return apiService
      .put<ApiResponse<Review>>(`/v1/reviews/${reviewId}`, data)
      .then((r) => r.data);
  },

  deleteReview(reviewId: number): Promise<void> {
    return apiService.delete(`/v1/reviews/${reviewId}`);
  },
};
