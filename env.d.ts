declare namespace NodeJS {
  interface ProcessEnv {
    // API Configuration
    NEXT_PUBLIC_API_URL: string;

    // Legacy (kept for compatibility)
    NEXT_PUBLIC_API_BASE_URL?: string;
    NEXT_PUBLIC_GOOGLE_LOGIN_PATH?: string;
  }
}
