export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface SearchMeta extends PaginationMeta {
  search_radius_km: number;
}

export interface ValidationError {
  message: string;
  errors: Record<string, string[]>;
}
