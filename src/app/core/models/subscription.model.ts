export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  monthly_price: number;
  annual_price?: number;
  currency: string;
  duration_days: number;
  features: Record<string, unknown>;
  commission_rate: number;
  max_subjects: number;
  includes_featured: boolean;
  featured_days: number;
  priority_support: boolean;
  is_active: boolean;
  sort_order: number;
}

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'suspended';

export interface TeacherSubscription {
  id: number;
  teacher_profile_id: number;
  plan_id: number;
  subscription_plan_id: number;
  payment_id?: number;
  starts_at: string;
  ends_at: string;
  status: SubscriptionStatus;
  auto_renew: boolean;
  plan?: SubscriptionPlan;
}

export type FeaturedPlanType = 'basic_boost' | 'premium_boost' | 'top_teacher';

export interface FeaturedListing {
  id: number;
  teacher_profile_id: number;
  payment_id?: number;
  plan_type: FeaturedPlanType;
  priority_score: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
}

export interface Commission {
  id: number;
  payment_id: number;
  booking_id: number;
  teacher_id: number;
  gross_amount: number;
  commission_rate: number;
  commission_amount: number;
  net_teacher_amount: number;
  status: 'pending' | 'settled' | 'paid_out';
  settled_at?: string;
  paid_out_at?: string;
  payout_reference?: string;
}
