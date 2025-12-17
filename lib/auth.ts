/**
 * Auth utilities - Cookie helpers
 */

import { COOKIES } from "./constants";

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split("=");
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
}

/**
 * Get the CSRF token from cookie
 */
export function getCsrfToken(): string | null {
  return getCookie(COOKIES.CSRF_TOKEN);
}

/**
 * Check if user has a session cookie (client-side check only)
 * Note: This is not a security check, just for UI purposes.
 * The actual session validation happens on the server.
 */
export function hasSessionCookie(): boolean {
  // session_id is HttpOnly, so we can't read it
  // We can check for csrf_token as a proxy (set at the same time)
  return getCookie(COOKIES.CSRF_TOKEN) !== null;
}

/**
 * Delete a cookie by name
 */
export function deleteCookie(name: string): void {
  if (typeof document === "undefined") {
    return;
  }
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}
