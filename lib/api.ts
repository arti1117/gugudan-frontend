/**
 * API client with CSRF token handling
 */

import { getCsrfToken } from "./auth";
import { API_BASE_URL } from "./constants";

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface RequestOptions {
  method?: RequestMethod;
  body?: unknown;
  headers?: Record<string, string>;
}

interface ApiError {
  detail: string;
  code?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Make an API request
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { method = "GET", body, headers = {} } = options;

    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };

    // Add CSRF token for mutating requests
    if (["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        requestHeaders["X-CSRF-Token"] = csrfToken;
      }
    }

    const url = endpoint.startsWith("http")
      ? endpoint
      : `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include", // Include cookies in requests
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        detail: `HTTP error ${response.status}`,
      }));
      throw new ApiClientError(error.detail, response.status, error.code);
    }

    // Handle empty responses
    const text = await response.text();
    if (!text) {
      return {} as T;
    }

    return JSON.parse(text) as T;
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", headers });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "POST", body, headers });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "PUT", body, headers });
  }

  /**
   * DELETE request
   */
  async delete<T>(
    endpoint: string,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE", headers });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "PATCH", body, headers });
  }
}

/**
 * Custom error class for API errors
 */
export class ApiClientError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
  }
}

// Export singleton instance
export const api = new ApiClient();

// Export class for custom instances
export { ApiClient };
