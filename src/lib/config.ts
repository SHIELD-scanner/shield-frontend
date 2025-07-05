// src/lib/config.ts

/**
 * Central configuration for backend API URL
 * This ensures all API routes use the same backend URL source
 */
export function getBackendUrl(): string {
  const backendUrl = process.env.BACKEND_API;
  return backendUrl && backendUrl.trim() !== '' ? backendUrl : 'http://localhost:8000';
}

/**
 * Get the full backend API URL with endpoint path
 */
export function getBackendApiUrl(endpoint: string): string {
  const baseUrl = getBackendUrl();
  // Ensure endpoint starts with /
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
}
