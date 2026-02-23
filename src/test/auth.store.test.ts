import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../app/store/auth.store';

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isTeacher: false,
      isParent: false,
      isAdmin: false,
      isLoading: false,
      error: null,
    });
  });

  it('should have correct initial state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isTeacher).toBe(false);
    expect(state.isParent).toBe(false);
    expect(state.isAdmin).toBe(false);
  });

  it('should clear error', () => {
    useAuthStore.setState({ error: 'Some error' });
    expect(useAuthStore.getState().error).toBe('Some error');

    useAuthStore.getState().clearError();
    expect(useAuthStore.getState().error).toBeNull();
  });

  it('should logout and clear all state', () => {
    useAuthStore.setState({
      user: { id: 1, first_name: 'Test', last_name: 'User', email: 'test@test.com', role: 'parent', is_active: true, created_at: '', updated_at: '' },
      token: 'test-token',
      isAuthenticated: true,
      isParent: true,
    });

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isTeacher).toBe(false);
    expect(state.isParent).toBe(false);
    expect(state.isAdmin).toBe(false);
  });

  it('should check role correctly', () => {
    useAuthStore.setState({
      user: { id: 1, first_name: 'Admin', last_name: 'User', email: 'admin@test.com', role: 'admin', is_active: true, created_at: '', updated_at: '' },
    });

    expect(useAuthStore.getState().hasRole('admin')).toBe(true);
    expect(useAuthStore.getState().hasRole('teacher')).toBe(false);
    expect(useAuthStore.getState().hasRole('parent')).toBe(false);
  });
});
