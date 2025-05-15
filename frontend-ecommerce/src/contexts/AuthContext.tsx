import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User, AuthState } from '../types/auth';
import { UserRole } from '../types/userRole';
import { api } from '../services/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...allowed: UserRole[]) => boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  const navigate = useNavigate();

  /* -----------------------------------------
   * Utils
   * ---------------------------------------*/
  const parseJwt = (token: string): any => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error('Impossible de décoder le JWT', err);
      return null;
    }
  };

  /* -----------------------------------------
   * Effet : restauration de session
   * ---------------------------------------*/
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = parseJwt(token);
      if (payload) {
        const user: User = {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          role: payload.role as UserRole,
          licenseeShops: payload.licenseeShops,
          isAdmin: [UserRole.ADMIN, UserRole.SUPERADMIN].includes(payload.role)
        };
        setState({ user, isAuthenticated: true, isLoading: false });
        return;
      }
    }
    setState(prev => ({ ...prev, isLoading: false }));
  }, []);

  /* -----------------------------------------
   * Méthodes
   * ---------------------------------------*/
  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken } = response.data;
      if (!accessToken) throw new Error('Jeton manquant');
      localStorage.setItem('token', accessToken);

      const payload = parseJwt(accessToken);
      const user: User = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role as UserRole,
        licenseeShops: payload.licenseeShops,
        isAdmin: [UserRole.ADMIN, UserRole.SUPERADMIN].includes(payload.role)
      };

      localStorage.setItem('user', JSON.stringify(user));
      setState({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      console.error('Erreur de connexion', error);
      setState({ user: null, isAuthenticated: false, isLoading: false });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setState({ user: null, isAuthenticated: false, isLoading: false });
    navigate('/');
  };

  const hasRole = (...allowed: UserRole[]): boolean => {
    if (!state.user) return false;
    return allowed.includes(state.user.role as UserRole);
  };

  const isAdmin = () => hasRole(UserRole.SUPERADMIN, UserRole.ADMIN);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, hasRole, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}