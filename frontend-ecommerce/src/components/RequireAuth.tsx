import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/userRole';

interface RequireAuthProps {
  children: JSX.Element;
  allowedRoles?: UserRole[];
  requireAdmin?: boolean; // Compat rétro
}

export function RequireAuth({ children, allowedRoles, requireAdmin = false }: RequireAuthProps) {
  const { isAuthenticated, isLoading, user, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-nolt-orange"></div>
    </div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Gestion requireAdmin pour compatibilité
  if (requireAdmin && !hasRole(UserRole.SUPERADMIN, UserRole.ADMIN)) {
    return <Navigate to="/" replace />;
  }

  // Gestion allowedRoles prioritaire
  if (allowedRoles && !allowedRoles.includes(user!.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}