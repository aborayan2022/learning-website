export type UserRole = 'admin' | 'parent' | 'teacher';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  is_active: boolean;
  email_verified_at?: string;
  phone_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TeacherUser extends User {
  teacher_profile: {
    id: number;
    bio: string;
    hourly_rate: number;
    currency: string;
    experience_years: number;
    avg_rating: number;
    total_reviews: number;
    total_bookings: number;
    verification_status: VerificationStatus;
    is_featured: boolean;
    featured_until?: string;
    accepts_online: boolean;
    accepts_in_person: boolean;
    is_available: boolean;
  };
}

export type VerificationStatus =
  | 'pending'
  | 'documents_submitted'
  | 'under_review'
  | 'verified'
  | 'rejected';
