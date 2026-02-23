import { create } from 'zustand';
import type { Teacher, MapMarker, TeacherSearchFilters } from '../core/models/teacher.model';
import { teacherSearchService } from '../core/services/teacher-search.service';

interface TeacherSearchState {
  teachers: Teacher[];
  mapMarkers: MapMarker[];
  selectedTeacher: Teacher | null;
  filters: TeacherSearchFilters;
  userLocation: { lat: number; lng: number } | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    searchRadiusKm: number;
  };

  // Actions
  setUserLocation: (lat: number, lng: number) => void;
  updateFilters: (filters: Partial<TeacherSearchFilters>) => void;
  selectTeacher: (teacher: Teacher | null) => void;
  searchNearby: (page?: number) => Promise<void>;
  loadMapMarkers: () => Promise<void>;
  loadTeacherProfile: (id: number) => Promise<Teacher>;
  resetFilters: () => void;
}

const DEFAULT_FILTERS: TeacherSearchFilters = {
  radius: 10000,
  subjectId: null,
  gradeLevelId: null,
  minRating: null,
  maxPrice: null,
  acceptsOnline: null,
};

export const useTeacherStore = create<TeacherSearchState>()((set, get) => ({
  teachers: [],
  mapMarkers: [],
  selectedTeacher: null,
  filters: { ...DEFAULT_FILTERS },
  userLocation: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    perPage: 20,
    total: 0,
    totalPages: 0,
    searchRadiusKm: 10,
  },

  setUserLocation: (lat: number, lng: number) => {
    set({ userLocation: { lat, lng } });
    get().searchNearby();
  },

  updateFilters: (filters: Partial<TeacherSearchFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
      pagination: { ...state.pagination, page: 1 },
    }));
    get().searchNearby();
  },

  selectTeacher: (teacher: Teacher | null) => {
    set({ selectedTeacher: teacher });
  },

  searchNearby: async (page?: number) => {
    const { userLocation, filters, pagination } = get();
    if (!userLocation) return;

    set({ isLoading: true, error: null });

    try {
      const result = await teacherSearchService.searchNearby({
        lat: userLocation.lat,
        lng: userLocation.lng,
        radius: filters.radius,
        subject_id: filters.subjectId,
        grade_level_id: filters.gradeLevelId,
        min_rating: filters.minRating,
        max_price: filters.maxPrice,
        accepts_online: filters.acceptsOnline,
        page: page ?? pagination.page,
        per_page: pagination.perPage,
      });

      set({
        teachers: result.data,
        isLoading: false,
        pagination: {
          page: result.meta.page,
          perPage: result.meta.per_page,
          total: result.meta.total,
          totalPages: result.meta.total_pages,
          searchRadiusKm: result.meta.search_radius_km,
        },
      });
    } catch (err: unknown) {
      const error = err as { message?: string };
      set({
        isLoading: false,
        error: error?.message || 'Search failed',
      });
    }
  },

  loadMapMarkers: async () => {
    const { userLocation, filters } = get();
    if (!userLocation) return;

    try {
      const markers = await teacherSearchService.getMapMarkers({
        lat: userLocation.lat,
        lng: userLocation.lng,
        radius: filters.radius * 2, // wider radius for map
        subject_id: filters.subjectId,
      });

      set({ mapMarkers: markers });
    } catch {
      // Silently fail for map markers, list is primary
    }
  },

  loadTeacherProfile: async (id: number) => {
    const teacher = await teacherSearchService.getTeacherProfile(id);
    set({ selectedTeacher: teacher });
    return teacher;
  },

  resetFilters: () => {
    set({ filters: { ...DEFAULT_FILTERS } });
  },
}));
