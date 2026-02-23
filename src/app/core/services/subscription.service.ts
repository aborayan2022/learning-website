import { apiService } from './api.service';
import type { SubscriptionPlan, TeacherSubscription, FeaturedListing } from '../models/subscription.model';
import type { ApiResponse } from '../models/api-response.model';

export const subscriptionService = {
  getPlans(): Promise<SubscriptionPlan[]> {
    return apiService
      .get<ApiResponse<SubscriptionPlan[]>>('/v1/subscriptions/plans')
      .then((r) => r.data);
  },

  getCurrentSubscription(): Promise<TeacherSubscription | null> {
    return apiService
      .get<ApiResponse<TeacherSubscription | null>>('/v1/subscriptions/my-subscription')
      .then((r) => r.data);
  },

  subscribe(planId: number, gateway: string = 'paymob'): Promise<{ subscription: TeacherSubscription; payment_url?: string }> {
    return apiService
      .post<ApiResponse<{ subscription: TeacherSubscription; payment_url?: string }>>(
        '/v1/subscriptions/subscribe',
        { plan_id: planId, gateway }
      )
      .then((r) => r.data);
  },

  cancelSubscription(): Promise<void> {
    return apiService.post('/v1/subscriptions/cancel');
  },

  purchaseFeaturedListing(planType: string, gateway: string = 'paymob'): Promise<FeaturedListing> {
    return apiService
      .post<ApiResponse<FeaturedListing>>('/v1/subscriptions/featured-listing', {
        plan_type: planType,
        gateway,
      })
      .then((r) => r.data);
  },
};
