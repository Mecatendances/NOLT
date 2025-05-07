export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'user';
  company?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}