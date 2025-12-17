"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { api, ApiClientError } from "@/lib/api";
import { API_ENDPOINTS, API_BASE_URL } from "@/lib/constants";
import type { AuthContextType, AuthStatusResponse, User } from "@/types/auth";

// Create context with undefined default
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null;

  /**
   * Fetch current auth status from server
   */
  const refreshAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get<AuthStatusResponse>(
        API_ENDPOINTS.AUTH_STATUS
      );

      if (response.is_authenticated && response.user) {
        setUser(response.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      // If not authenticated or error, clear user
      setUser(null);

      // Log unexpected errors (not 401)
      if (error instanceof ApiClientError && error.status !== 401) {
        console.error("Auth refresh error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Initiate OAuth login
   */
  const login = useCallback((provider: string) => {
    // Redirect to backend OAuth endpoint
    const authUrl = `${API_BASE_URL}/api/v1/auth/${provider}`;
    window.location.href = authUrl;
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      await api.post(API_ENDPOINTS.AUTH_LOGOUT);
    } catch (error) {
      // Log error but proceed with local logout
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  }, []);

  // Check auth status on mount
  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      refreshAuth,
    }),
    [user, isAuthenticated, isLoading, login, logout, refreshAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
