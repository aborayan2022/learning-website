import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '../core/models/user.model';
import { authService } from '../core/services/auth.service';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  // Computed-like getters
  isAuthenticated: boolean;
  isTeacher: boolean;
  isParent: boolean;
  isAdmin: boolean;

  // Actions
  login: (email: string, password: string) => Promise<string>;
  register: (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    password: string;
    password_confirmation: string;
    role: 'parent' | 'teacher';
  }) => Promise<void>;
  loadProfile: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
  hasRole: (role: UserRole) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      isAuthenticated: false,
      isTeacher: false,
      isParent: false,
      isAdmin: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login({ email, password });
          set({
            user: response.user,
            token: response.token,
            isLoading: false,
            isAuthenticated: true,
            isTeacher: response.user.role === 'teacher',
            isParent: response.user.role === 'parent',
            isAdmin: response.user.role === 'admin',
          });

          // Return redirect path based on role
          const redirectMap: Record<string, string> = {
            admin: '/admin',
            teacher: '/dashboard/teacher',
            parent: '/dashboard/parent',
          };
          return redirectMap[response.user.role] || '/';
        } catch (err: unknown) {
          const error = err as { response?: { data?: { message?: string } } };
          set({
            isLoading: false,
            error: error?.response?.data?.message || 'Login failed',
          });
          throw err;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register(data);
          set({
            user: response.user,
            token: response.token,
            isLoading: false,
            isAuthenticated: true,
            isTeacher: response.user.role === 'teacher',
            isParent: response.user.role === 'parent',
            isAdmin: response.user.role === 'admin',
          });
        } catch (err: unknown) {
          const error = err as { response?: { data?: { message?: string } } };
          set({
            isLoading: false,
            error: error?.response?.data?.message || 'Registration failed',
          });
          throw err;
        }
      },

      loadProfile: async () => {
        const token = get().token;
        if (!token) return;
        try {
          const user = await authService.getProfile();
          set({
            user,
            isAuthenticated: true,
            isTeacher: user.role === 'teacher',
            isParent: user.role === 'parent',
            isAdmin: user.role === 'admin',
          });
        } catch {
          get().logout();
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isTeacher: false,
          isParent: false,
          isAdmin: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),

      hasRole: (role: UserRole) => {
        const user = get().user;
        return user?.role === role;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isTeacher: state.isTeacher,
        isParent: state.isParent,
        isAdmin: state.isAdmin,
      }),
    }
  )
);
