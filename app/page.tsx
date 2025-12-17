"use client";

import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/constants";

export default function HomePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Gugudan</h1>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600">
                  Hello, {user?.nickname}
                </span>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center space-y-6">
          <h2 className="text-4xl font-bold text-gray-900">
            AI Counselor for Couples
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get help with emotional problems in your relationship through
            AI-powered counseling sessions.
          </p>

          {isAuthenticated ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                Ready to start a consultation?
              </p>
              <Link href={ROUTES.CONSULTATION}>
                <Button size="lg">Start Consultation</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600">
                Sign in to begin your journey
              </p>
              <Link href={ROUTES.LOGIN}>
                <Button size="lg">Get Started</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Private & Secure
            </h3>
            <p className="text-gray-600">
              All conversations are encrypted. Your privacy is our priority.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              AI-Powered
            </h3>
            <p className="text-gray-600">
              Get thoughtful responses from our AI counselor, available 24/7.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              For Couples
            </h3>
            <p className="text-gray-600">
              Designed specifically to help couples navigate emotional challenges.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
