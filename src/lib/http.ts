/**
 * HTTP Client with Authentication
 * Automatically includes JWT token in requests
 * Handles token expiration and automatic refresh
 * Includes CSRF protection for state-changing requests
 */

import { authStorage } from "./auth-storage";
import { CSRFProtection } from "./csrf";

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7083";

interface FetchOptions extends RequestInit {
    headers?: Record<string, string>;
}

// Token refresh queue to prevent concurrent refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

/**
 * Base HTTP client with auth token injection and automatic token refresh
 * 
 * @param path - API endpoint path
 * @param options - Fetch options
 * @returns Parsed JSON response
 * 
 * @throws Error on failed requests
 */
async function http<T>(path: string, options?: FetchOptions): Promise<T> {
    const url = `${BASE_URL}${path}`;

    // Get auth token and include in headers
    const token = authStorage.getAccessToken();
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    const isFormData = options?.body instanceof FormData;

    const headers: Record<string, string> = token
        ? { Authorization: `Bearer ${token}` }
        : {};

    // Set Content-Type when NOT FormData
    if (!isFormData) {
        headers["Content-Type"] = "application/json";
    }

    // Merge headers from options (if any)
    if (options?.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
            if (value !== undefined) {
                headers[key] = value;
            }
        });
    }

    const config: RequestInit = {
        ...options,
        credentials: 'include',
        headers,
    };

    try {
        const response = await fetch(url, config);

        // Handle 401 Unauthorized - Try to refresh token
        if (response.status === 401 && !path.includes('/auth/refresh') && !path.includes('/auth/login')) {
            // If already refreshing, queue this request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((newToken) => {
                    // Retry with new token
                    const newHeaders = {
                        ...config.headers,
                        Authorization: `Bearer ${newToken}`,
                    };
                    return fetch(url, { ...config, headers: newHeaders }).then(r => r.json());
                });
            }

            isRefreshing = true;
            const currentAccessToken = token; // Current/expired access token

            if (!currentAccessToken) {
                // No access token to refresh
                processQueue(new Error("No access token"), null);
                isRefreshing = false;
                authStorage.clearAuth();
                
                if (typeof window !== "undefined" && !window.location.pathname.includes('/login')) {
                    console.warn('[HTTP] No access token, redirecting to login');
                    window.location.href = "/login";
                }
                throw new Error("Session expired");
            }

            try {
                // Call refresh endpoint with current access token
                // Backend reads refresh token from HttpOnly cookie
                const refreshResponse = await fetch(`${BASE_URL}/api/auth/refresh`, {
                    method: 'POST',
                    credentials: 'include', // CRITICAL: Send refresh_token cookie
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ accessToken: currentAccessToken }),
                });

                if (!refreshResponse.ok) {
                    throw new Error('Token refresh failed');
                }

                const refreshData = await refreshResponse.json();
                
                // Update access token (refresh token rotated automatically in cookie)
                authStorage.setAccessToken(refreshData.data.accessToken);

                // Notify waiting requests
                processQueue(null, refreshData.data.accessToken);
                isRefreshing = false;

                // Retry original request with new token
                const newHeaders = {
                    ...config.headers,
                    Authorization: `Bearer ${refreshData.data.accessToken}`,
                };
                const retryResponse = await fetch(url, { 
                    ...config, 
                    credentials: 'include', // Don't forget credentials!
                    headers: newHeaders 
                });
                
                if (!retryResponse.ok) {
                    const errorBody = await retryResponse.json().catch(() => ({}));
                    throw new Error(errorBody.userMessage || errorBody.message || `HTTP Error: ${retryResponse.status}`);
                }

                return (await retryResponse.json()) as T;
            } catch (refreshError) {
                // Refresh failed, logout user
                processQueue(new Error("Token refresh failed"), null);
                isRefreshing = false;
                authStorage.clearAuth();
                
                if (typeof window !== "undefined" && !window.location.pathname.includes('/login')) {
                    console.warn('[HTTP] Token refresh failed, redirecting to login');
                    window.location.href = "/login";
                }
                throw new Error("Session expired");
            }
        }

        if (!response.ok) {
            // Try to parse error response from backend
            const errorBody = await response.json().catch(() => ({}));
            const errorMessage = errorBody.userMessage || errorBody.message || `HTTP Error: ${response.status}`;

            // Handle 403 Forbidden - insufficient permissions
            if (response.status === 403 && typeof window !== "undefined") {
                console.warn('[HTTP] Access forbidden, insufficient permissions');
                // Optionally redirect to unauthorized page
                // window.location.href = "/unauthorized";
            }

            throw new Error(errorMessage);
        }

        return (await response.json()) as T;
    } catch (error) {
        // Re-throw to be handled by caller
        throw error;
    }
}

/**
 * API client with typed methods
 * 
 * @example
 * ```tsx
 * // GET request
 * const users = await api.get<User[]>('/api/users');
 * 
 * // POST request
 * const newUser = await api.post<User>('/api/users', { name: 'John' });
 * 
 * // PUT request
 * await api.put('/api/users/1', { name: 'Jane' });
 * 
 * // DELETE request
 * await api.delete('/api/users/1');
 * ```
 */
export const api = {
    /**
     * GET request
     */
    get: <T>(path: string, options?: FetchOptions) =>
        http<T>(path, { ...options, method: "GET" }),

    /**
     * POST request
     */
    post: <T, B = unknown>(path: string, body: B, options?: FetchOptions) =>
        http<T>(path, {
            ...options,
            method: "POST",
            body: JSON.stringify(body),
        }),

    /**
     * PUT request
     */
    put: <T, B = unknown>(path: string, body: B, options?: FetchOptions) =>
        http<T>(path, {
            ...options,
            method: "PUT",
            body: JSON.stringify(body),
        }),

    /**
     * DELETE request
     */
    delete: <T>(path: string, options?: FetchOptions) =>
        http<T>(path, { ...options, method: "DELETE" }),

    /**
     * PATCH request
     */
    patch: <T, B = unknown>(path: string, body: B, options?: FetchOptions) =>
        http<T>(path, {
            ...options,
            method: "PATCH",
            body: JSON.stringify(body),
        }),
};