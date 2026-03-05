/**
 * Next.js Instrumentation Hook
 * Runs once when the server is initialized, before any requests are handled.
 */
export async function register() {
    if (process.env.NODE_ENV !== 'production') {
        // Cho phép self-signed certificate khi gọi API từ Server Component trong môi trường dev
        // Backend chạy trên https://localhost:7083 với cert tự ký
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    } else {
        // Kiểm tra bắt buộc khi deploy production
        if (!process.env.NEXT_PUBLIC_API_URL) {
            // Không throw để tránh crash server, nhưng warning rõ ràng trong logs
            console.error(
                '[CONFIG ERROR] NEXT_PUBLIC_API_URL is not set in production. ' +
                'All API calls will fail. Set this env var in your deployment environment.'
            );
        }
    }
}
