"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/constants";

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Protected route wrapper component
 *
 * Redirects to login page if user is not authenticated.
 * Shows loading state while checking authentication.
 */
export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading state
  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )
    );
  }

  // Show nothing while redirecting
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
