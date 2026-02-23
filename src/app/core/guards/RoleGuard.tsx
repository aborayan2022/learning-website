import { Navigate } from 'react-router';
import { useAuthStore } from '../../store/auth.store';
import type { UserRole } from '../models/user.model';
import type { ReactNode } from 'react';

interface RoleGuardProps {
  children: ReactNode;
  roles: UserRole[];
}

export function RoleGuard({ children, roles }: RoleGuardProps) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
