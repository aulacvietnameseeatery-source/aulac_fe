/**
 * HTTP Client with Authentication
 * Automatically includes JWT token in requests
 * Handles token expiration and redirects
 */

import { authStorage } from "./auth-storage";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7083";

interface FetchOptions extends RequestInit {
    headers?: Record<string, string>;
}

/**
 * Base HTTP client with auth token injection
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

    const config: RequestInit = {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...authHeaders,
            ...options?.headers,
        } as HeadersInit,
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            // Try to parse error response from backend
            const errorBody = await response.json().catch(() => ({}));
            const errorMessage = errorBody.userMessage || errorBody.message || `HTTP Error: ${response.status}`;

            // Handle 401 Unauthorized - clear auth and redirect
            if (response.status === 401) {
                const hadToken = !!token;
                authStorage.clearAuth();

                // Only redirect if user was previously authenticated
                // and NOT on the login page
                if (hadToken && typeof window !== "undefined" && !window.location.pathname.includes('/login')) {
                    console.warn('[HTTP] Session expired, redirecting to login');
                    window.location.href = "/login";
                }
            }

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