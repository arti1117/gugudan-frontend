"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import {GoogleLoginButton, NaverLoginButton} from "@/components/auth/LoginButton";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/constants";

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to home if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(ROUTES.HOME);
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Don't render login form if authenticated (redirecting)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Gugudan</h1>
          <p className="mt-2 text-gray-600">
            AI Counselor for Couples
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Welcome</h2>
            <p className="mt-1 text-sm text-gray-500">
              Sign in to start your consultation
            </p>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <GoogleLoginButton />
  {/*          <KakaoLoginButton />*/}
            <NaverLoginButton />
          </div>

          {/* Terms notice */}
          <p className="text-xs text-center text-gray-500">
            By signing in, you agree to our{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500">
          Your conversations are encrypted and private
        </p>
      </div>
    </div>
  );
}
