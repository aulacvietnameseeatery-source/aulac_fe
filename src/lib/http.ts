
import { tokenStorage } from "./auth-storage";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5275";

type FetchOptions = RequestInit & {
    headers?: Record<string, string>;
};

async function http<T>(path: string, options?: FetchOptions): Promise<T> {
    const url = `${BASE_URL}${path}`;

    // Get auth token and include in headers
    const token = tokenStorage.getAccessToken();
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
            
            // Handle 401 Unauthorized - only redirect if user had a token (session expired)
            // Don't redirect on login failures (when there's no token)
            if (response.status === 401) {
                const hadToken = !!token; // Check if there was a token before this request
                tokenStorage.clearAuth();
                
                // Only redirect if user was previously authenticated (had token)
                // and NOT on the login page
                if (hadToken && typeof window !== "undefined" && !window.location.pathname.includes('/login')) {
                    window.location.href = "/login";
                }
            }
            
            throw new Error(errorMessage);
        }

        return (await response.json()) as T;
    } catch (error) {
        throw error;
    }
}

export const api = {
    get: <T>(path: string, options?: FetchOptions) =>
        http<T>(path, { ...options, method: "GET" }),

    // post: <T>(path: string, body: never, options?: FetchOptions) =>
    //     http<T>(path, { ...options, method: "POST", body: JSON.stringify(body) }),

    put: <T>(path: string, body: never, options?: FetchOptions) =>
        http<T>(path, { ...options, method: "PUT", body: JSON.stringify(body) }),

    delete: <T>(path: string, options?: FetchOptions) =>
        http<T>(path, { ...options, method: "DELETE" }),

    post: <T, B = unknown>(
    path: string,
    body: B,
    options?: FetchOptions
  ) =>
    http<T>(path, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    }),

};