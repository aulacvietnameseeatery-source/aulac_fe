"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Dữ liệu sẽ được coi là "cũ" sau 1 phút (không fetch lại ngay lập tức)
                        staleTime: 60 * 1000,
                        // Tự động fetch lại khi cửa sổ focus
                        refetchOnWindowFocus: false,
                        // Thử lại 1 lần nếu API lỗi
                        retry: 1,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/* Công cụ Debug (Chỉ hiện khi dev, lên production tự ẩn) */}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}