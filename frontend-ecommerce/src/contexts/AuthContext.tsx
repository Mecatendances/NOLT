import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User, AuthState } from '../types/auth';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock des données utilisateur pour la démo
const MOCK_USERS = {
  'admin@fcchalon.com': {
    id: 1,
    email: 'admin@fcchalon.com',
    name: 'Admin FC Chalon',
    role: 'admin',
    company: 'FC Chalon'
  } as User,
  'user@example.com': {
    id: 2,
    email: 'user@example.com',
    name: 'John Doe',
    role: 'user',
    company: 'Club de Sport'
  } as User
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Vérifie si un utilisateur est déjà connecté
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setState({
        user: JSON.parse(savedUser),
        isAuthenticated: true,
        isLoading: false
      });
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Simulation d'une requête d'authentification
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = MOCK_USERS[email as keyof typeof MOCK_USERS];
    if (!user || password !== 'password') {
      throw new Error('Identifiants invalides');
    }

    localStorage.setItem('user', JSON.stringify(user));
    setState({
      user,
      isAuthenticated: true,
      isLoading: false
    });
  };

  const logout = () => {
    localStorage.removeItem('user');
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
    navigate('/');
  };

  const isAdmin = () => {
    return state.user?.role === 'admin' && state.user?.company === 'FC Chalon';
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, isAdmin }}>
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