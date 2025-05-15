import { UserRole } from './userRole';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  licenseeShops?: string[];
  isAdmin?: boolean;
  phone?: string;
  address?: string;
  zipCode?: string;
  city?: string;
  preferredClub?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}