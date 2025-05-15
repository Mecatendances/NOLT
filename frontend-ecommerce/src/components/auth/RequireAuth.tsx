import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/userRole';

interface RequireAuthProps {
  children: JSX.Element;
  allowedRoles?: UserRole[];
  requireAdmin?: boolean;
}

export function RequireAuth({ children, allowedRoles, requireAdmin = false }: RequireAuthProps) {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !hasRole(UserRole.SUPERADMIN, UserRole.ADMIN)) {
    return <Navigate to="/shops" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user!.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}