export interface Teacher {
  id: number;
  teacher_profile_id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  bio?: string;
  hourly_rate: number;
  currency: string;
  avg_rating: number;
  total_reviews: number;
  total_bookings: number;
  experience_years: number;
  is_featured: boolean;
  accepts_online: boolean;
  accepts_in_person: boolean;
  city: string;
  governorate: string;
  distance_km: number;
  subjects?: TeacherSubject[];
  availabilities?: TeacherAvailability[];
}

export interface TeacherSubject {
  id?: number;
  subject_id: number;
  subject_name: string;
  icon?: string;
  grade_level_id: number;
  grade_level_name: string;
  effective_price: number;
}

export interface TeacherAvailability {
  id: number;
  day_of_week: number; // 0=Sunday, 6=Saturday
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export interface MapMarker {
  id: number;
  first_name: string;
  last_name: string;
  hourly_rate: number;
  avg_rating: number;
  is_featured: boolean;
  latitude: number;
  longitude: number;
  distance_km: number;
}

export interface TeacherSearchFilters {
  radius: number;
  subjectId: number | null;
  gradeLevelId: number | null;
  minRating: number | null;
  maxPrice: number | null;
  acceptsOnline: boolean | null;
}

export interface Subject {
  id: number;
  name: string;
  name_ar?: string;
  slug: string;
  icon?: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
}

export interface GradeLevel {
  id: number;
  name: string;
  name_ar?: string;
  slug: string;
  stage: 'kindergarten' | 'primary' | 'preparatory' | 'secondary' | 'university';
  sort_order: number;
  is_active: boolean;
}

export interface Location {
  id: number;
  teacher_profile_id: number;
  label: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  governorate: string;
  postal_code?: string;
  country: string;
  latitude: number;
  longitude: number;
  is_primary: boolean;
  is_active: boolean;
}
