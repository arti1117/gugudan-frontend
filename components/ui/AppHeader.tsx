"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/constants";

export function AppHeader() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href={ROUTES.HOME ?? "/"}>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Gugudan
          </h1>
        </Link>

    <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : isAuthenticated ? (
            <>
              <span className="text-sm text-gray-600">
                안녕하세요, {user?.nickname}님
              </span>

              <Link href={ROUTES.MY_PAGE}>
                <Button variant="ghost" size="sm">
                  My Page
                </Button>
              </Link>

              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <Link href={ROUTES.LOGIN}>
              <Button size="sm">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
