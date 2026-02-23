import { Navigate, useLocation } from 'react-router';
import { useAuthStore } from '../../store/auth.store';
import type { ReactNode } from 'react';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ returnUrl: location.pathname }} replace />;
  }

  return <>{children}</>;
}
