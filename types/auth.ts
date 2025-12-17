/**
 * Auth-related TypeScript types
 */

export interface User {
  id: number;
  email: string;
  nickname: string;
  terms_agreed: boolean;
  created_at: string;
}

export interface AuthStatusResponse {
  is_authenticated: boolean;
  user: User | null;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (provider: string) => void;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

export interface OAuthProvidersResponse {
  providers: string[];
}
