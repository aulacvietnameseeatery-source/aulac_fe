
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.aulac.com"; // todo thay api url

type FetchOptions = RequestInit & {
    headers?: Record<string, string>;
};

async function http<T>(path: string, options?: FetchOptions): Promise<T> {
    const url = `${BASE_URL}${path}`;

    const config: RequestInit = {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },

    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(errorBody.message || `HTTP Error: ${response.status}`);
        }

        return (await response.json()) as T;
    } catch (error) {
        console.error(`[API Error] ${path}:`, error);
        throw error;
    }
}

export const api = {
    get: <T>(path: string, options?: FetchOptions) =>
        http<T>(path, { ...options, method: "GET" }),

    post: <T>(path: string, body: never, options?: FetchOptions) =>
        http<T>(path, { ...options, method: "POST", body: JSON.stringify(body) }),

    put: <T>(path: string, body: never, options?: FetchOptions) =>
        http<T>(path, { ...options, method: "PUT", body: JSON.stringify(body) }),

    delete: <T>(path: string, options?: FetchOptions) =>
        http<T>(path, { ...options, method: "DELETE" }),
};