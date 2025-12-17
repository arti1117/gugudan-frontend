"use client";

import { useContext } from "react";

import { AuthContext } from "@/components/auth/AuthProvider";
import type { AuthContextType } from "@/types/auth";

/**
 * Hook to access authentication state and actions
 *
 * @throws Error if used outside of AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
