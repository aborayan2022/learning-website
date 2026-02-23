import { Navigate } from 'react-router';
import { useAuthStore } from '../../store/auth.store';
import type { ReactNode } from 'react';

interface GuestGuardProps {
  children: ReactNode;
}

/** Redirect authenticated users away from auth pages */
export function GuestGuard({ children }: GuestGuardProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    const redirectMap: Record<string, string> = {
      admin: '/admin',
      teacher: '/dashboard/teacher',
      parent: '/dashboard/parent',
    };
    return <Navigate to={redirectMap[user.role] || '/'} replace />;
  }

  return <>{children}</>;
}
