export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'disputed';

export type LocationType = 'online' | 'in_person' | 'teacher_location' | 'student_home' | 'agreed_location';

export interface Booking {
  id: number;
  reference: string;
  parent_id: number;
  teacher_id: number;
  subject_id: number;
  grade_level_id?: number;
  subject_name?: string;
  teacher_name?: string;
  parent_name?: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  scheduled_at: string;
  duration_minutes: number;
  status: BookingStatus;
  location_type: LocationType;
  location_address?: string;
  meeting_address?: string;
  meeting_lat?: number;
  meeting_lng?: number;
  meeting_link?: string;
  total_price: number;
  agreed_price: number;
  currency: string;
  notes?: string;
  cancellation_reason?: string;
  cancelled_by?: 'parent' | 'teacher' | 'admin' | 'system';
  confirmed_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBookingPayload {
  teacher_id: number;
  subject_id?: number;
  teacher_subject_id?: number;
  grade_level_id?: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  scheduled_at?: string;
  duration_minutes?: number;
  location_type: LocationType;
  location_address?: string;
  meeting_address?: string;
  notes?: string;
  agreed_price?: number;
}
