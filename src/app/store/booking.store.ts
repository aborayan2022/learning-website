import { create } from 'zustand';
import type { Booking, CreateBookingPayload } from '../core/models/booking.model';
import { bookingService } from '../core/services/booking.service';

interface BookingState {
  bookings: Booking[];
  currentBooking: Booking | null;
  upcomingBookings: Booking[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };

  // Actions
  loadBookings: (params?: { status?: string; page?: number }) => Promise<void>;
  loadBooking: (id: number) => Promise<void>;
  createBooking: (data: CreateBookingPayload) => Promise<Booking>;
  confirmBooking: (bookingId: number) => Promise<void>;
  cancelBooking: (bookingId: number, reason: string) => Promise<void>;
  completeBooking: (bookingId: number) => Promise<void>;
  loadUpcomingBookings: () => Promise<void>;
  clearError: () => void;
}

export const useBookingStore = create<BookingState>()((set, get) => ({
  bookings: [],
  currentBooking: null,
  upcomingBookings: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    perPage: 20,
    total: 0,
    totalPages: 0,
  },

  loadBookings: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const result = await bookingService.getBookings(params);
      set({
        bookings: result.data,
        isLoading: false,
        pagination: {
          page: result.meta.page,
          perPage: result.meta.per_page,
          total: result.meta.total,
          totalPages: result.meta.total_pages,
        },
      });
    } catch (err: unknown) {
      const error = err as { message?: string };
      set({
        isLoading: false,
        error: error?.message || 'Failed to load bookings',
      });
    }
  },

  loadBooking: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const booking = await bookingService.getBooking(id);
      set({ currentBooking: booking, isLoading: false });
    } catch (err: unknown) {
      const error = err as { message?: string };
      set({
        isLoading: false,
        error: error?.message || 'Failed to load booking',
      });
    }
  },

  createBooking: async (data: CreateBookingPayload) => {
    set({ isLoading: true, error: null });
    try {
      const booking = await bookingService.createBooking(data);
      set({ currentBooking: booking, isLoading: false });
      return booking;
    } catch (err: unknown) {
      const error = err as { message?: string };
      set({
        isLoading: false,
        error: error?.message || 'Failed to create booking',
      });
      throw err;
    }
  },

  confirmBooking: async (bookingId: number) => {
    try {
      const booking = await bookingService.confirmBooking(bookingId);
      set((state) => ({
        currentBooking: booking,
        bookings: state.bookings.map((b) => (b.id === bookingId ? booking : b)),
      }));
    } catch (err: unknown) {
      const error = err as { message?: string };
      set({ error: error?.message || 'Failed to confirm booking' });
    }
  },

  cancelBooking: async (bookingId: number, reason: string) => {
    try {
      const booking = await bookingService.cancelBooking(bookingId, reason);
      set((state) => ({
        currentBooking: booking,
        bookings: state.bookings.map((b) => (b.id === bookingId ? booking : b)),
      }));
    } catch (err: unknown) {
      const error = err as { message?: string };
      set({ error: error?.message || 'Failed to cancel booking' });
    }
  },

  completeBooking: async (bookingId: number) => {
    try {
      const booking = await bookingService.completeBooking(bookingId);
      set((state) => ({
        currentBooking: booking,
        bookings: state.bookings.map((b) => (b.id === bookingId ? booking : b)),
      }));
    } catch (err: unknown) {
      const error = err as { message?: string };
      set({ error: error?.message || 'Failed to complete booking' });
    }
  },

  loadUpcomingBookings: async () => {
    try {
      const bookings = await bookingService.getUpcomingBookings();
      set({ upcomingBookings: bookings });
    } catch {
      // silently fail
    }
  },

  clearError: () => set({ error: null }),
}));
