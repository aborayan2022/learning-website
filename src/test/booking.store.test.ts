import { describe, it, expect, beforeEach } from 'vitest';
import { useBookingStore } from '../app/store/booking.store';

describe('Booking Store', () => {
  beforeEach(() => {
    useBookingStore.setState({
      bookings: [],
      currentBooking: null,
      upcomingBookings: [],
      isLoading: false,
      error: null,
      pagination: { page: 1, perPage: 20, total: 0, totalPages: 0 },
    });
  });

  it('should have correct initial state', () => {
    const state = useBookingStore.getState();
    expect(state.bookings).toEqual([]);
    expect(state.currentBooking).toBeNull();
    expect(state.upcomingBookings).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should clear error', () => {
    useBookingStore.setState({ error: 'Some error' });
    expect(useBookingStore.getState().error).toBe('Some error');

    useBookingStore.getState().clearError();
    expect(useBookingStore.getState().error).toBeNull();
  });

  it('should have default pagination', () => {
    const { pagination } = useBookingStore.getState();
    expect(pagination.page).toBe(1);
    expect(pagination.perPage).toBe(20);
    expect(pagination.total).toBe(0);
    expect(pagination.totalPages).toBe(0);
  });

  it('should update state correctly when set', () => {
    useBookingStore.setState({
      isLoading: true,
      error: 'Test error',
    });
    const state = useBookingStore.getState();
    expect(state.isLoading).toBe(true);
    expect(state.error).toBe('Test error');
  });
});
