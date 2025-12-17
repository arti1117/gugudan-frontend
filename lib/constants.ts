/**
 * Application constants
 */

// API Configuration
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:33333";

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH_GOOGLE: `${API_BASE_URL}/api/v1/auth/google`,
  AUTH_KAKAO: `${API_BASE_URL}/api/v1/auth/kakao`,
  AUTH_NAVER: `${API_BASE_URL}/api/v1/auth/naver`,
  AUTH_LOGOUT: `${API_BASE_URL}/api/v1/auth/logout`,
  AUTH_ME: `${API_BASE_URL}/api/v1/auth/me`,
  AUTH_STATUS: `${API_BASE_URL}/api/v1/auth/status`,
  AUTH_PROVIDERS: `${API_BASE_URL}/api/v1/auth/providers`,
} as const;

// Routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  CONSULTATION: "/consultation",
  MY_PAGE: "/my",
} as const;

// Cookie names
export const COOKIES = {
  SESSION_ID: "session_id",
  CSRF_TOKEN: "csrf_token",
} as const;

// OAuth Provider names
export const OAUTH_PROVIDERS = {
  GOOGLE: "google",
  KAKAO: "kakao",
  NAVER: "naver",
} as const;

export type OAuthProvider = (typeof OAUTH_PROVIDERS)[keyof typeof OAUTH_PROVIDERS];
