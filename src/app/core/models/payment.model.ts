export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'partially_refunded'
  | 'disputed';

export type PaymentGateway = 'stripe' | 'paymob' | 'wallet' | 'manual';
export type PaymentType = 'booking_payment' | 'subscription' | 'featured_listing' | 'refund';

export interface Payment {
  id: number;
  reference: string;
  booking_id?: number;
  user_id: number;
  amount: number;
  platform_fee: number;
  currency: string;
  gateway: PaymentGateway;
  gateway_transaction_id?: string;
  gateway_order_id?: string;
  status: PaymentStatus;
  type: PaymentType;
  paid_at?: string;
  refunded_at?: string;
  refund_amount?: number;
  refund_reason?: string;
  created_at: string;
}

export interface PaymentInitiation {
  payment_id: number;
  payment_reference: string;
  gateway: PaymentGateway;
  payment_url?: string;
  client_secret?: string;
  iframe_id?: string;
}

export interface Review {
  id: number;
  booking_id: number;
  reviewer_id: number;
  teacher_id: number;
  rating: number;
  comment?: string;
  teaching_quality?: number;
  punctuality?: number;
  communication?: number;
  is_visible: boolean;
  reviewer_name?: string;
  reviewer_avatar?: string;
  created_at: string;
}

export interface CreateReviewPayload {
  booking_id: number;
  rating: number;
  comment?: string;
  teaching_quality?: number;
  punctuality?: number;
  communication?: number;
}
