/**
 * HTTP Client with Authentication
 * Automatically includes JWT token in requests
 * Handles token expiration and automatic refresh
 * Includes CSRF protection for state-changing requests
 */

import { authStorage } from "./auth-storage";
// import { CSRFProtection } from "./csrf"; // Đảm bảo bạn đã import đúng nếu cần

// URL của backend API.
// - DEV: fallback về localhost:7083 (tự ký TLS, xử lý bởi instrumentation.ts)
// - PRODUCTION: BẮT BUỘC phải set NEXT_PUBLIC_API_URL trong môi trường deploy
//   (Vercel → Project Settings → Environment Variables, hoặc .env.production)
//   Ví dụ: NEXT_PUBLIC_API_URL=https://api.aulac.com
export const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://localhost:7083";

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
 */
async function http<T>(path: string, options?: FetchOptions): Promise<T> {
    const url = `${BASE_URL}${path}`;

    // Get auth token and include in headers
    const token = authStorage.getAccessToken();

    // Đã xóa biến authHeaders thừa ở đây

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
                // SỬA LỖI 1: Thêm <string> vào Promise
                return new Promise<string>((resolve, reject) => {
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
            const currentAccessToken = token;

            if (!currentAccessToken) {
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
                const refreshResponse = await fetch(`${BASE_URL}/api/auth/refresh`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ accessToken: currentAccessToken }),
                });

                if (!refreshResponse.ok) {
                    throw new Error('Token refresh failed');
                }

                const refreshData = await refreshResponse.json();

                authStorage.setAccessToken(refreshData.data.accessToken);

                processQueue(null, refreshData.data.accessToken);
                isRefreshing = false;

                const newHeaders = {
                    ...config.headers,
                    Authorization: `Bearer ${refreshData.data.accessToken}`,
                };
                const retryResponse = await fetch(url, {
                    ...config,
                    credentials: 'include',
                    headers: newHeaders
                });

                if (!retryResponse.ok) {
                    const errorBody = await retryResponse.json().catch(() => ({}));
                    throw new Error(errorBody.userMessage || errorBody.message || `HTTP Error: ${retryResponse.status}`);
                }

                return (await retryResponse.json()) as T;
            } catch (refreshError) {
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
            const errorBody = await response.json().catch(() => ({}));
            const errorMessage = errorBody.userMessage || errorBody.message || `HTTP Error: ${response.status}`;

            if (response.status === 403 && typeof window !== "undefined") {
                console.warn('[HTTP] Access forbidden, insufficient permissions');
            }

            const error = new Error(errorMessage) as any;
            error.response = {
                data: errorBody,
                status: response.status
            };
            throw error;
        }

        return (await response.json()) as T;
    } catch (error) {
        throw error;
    }
}

export const api = {
    get: <T>(path: string, options?: FetchOptions) =>
        http<T>(path, { ...options, method: "GET" }),

    post: <T, B = unknown>(path: string, body: B, options?: FetchOptions) =>
        http<T>(path, {
            ...options,
            method: "POST",
            // SỬA LỖI 2: Ép kiểu body as any
            body: (body as any) instanceof FormData
                ? (body as any)
                : JSON.stringify(body),
        }),

    put: <T, B = unknown>(path: string, body: B, options?: FetchOptions) =>
        http<T>(path, {
            ...options,
            method: "PUT",
            // SỬA LỖI 2: Ép kiểu body as any
            body: (body as any) instanceof FormData
                ? (body as any)
                : JSON.stringify(body),
        }),

    delete: <T>(path: string, options?: FetchOptions) =>
        http<T>(path, { ...options, method: "DELETE" }),

    patch: <T, B = unknown>(path: string, body: B, options?: FetchOptions) =>
        http<T>(path, {
            ...options,
            method: "PATCH",
            // SỬA LỖI 3: Thêm check FormData cho PATCH
            body: (body as any) instanceof FormData
                ? (body as any)
                : JSON.stringify(body),
        }),
};