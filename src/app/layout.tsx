import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import QueryProvider from "@/components/providers/query-provider";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });

// 1. Cấu hình Viewport (Mobile & PWA)
export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false, // Chặn zoom để giống App
    viewportFit: 'cover',
    themeColor: '#FAF9F6', // Màu thanh status bar trùng màu nền web
};

// 2. Cấu hình Metadata (Apple Specific)
export const metadata: Metadata = {
    title: "Bamee Gasstro - Vietnamese Eatery",
    description: "The pinnacle of Vietnamese culinary art.",

    //  Cấu hình quan trọng cho Apple Devices
    appleWebApp: {
        capable: true, // Biến web thành Web App
        title: "Bamee Menu",
        statusBarStyle: "black-translucent", // Thanh status bar trong suốt đè lên nền
        // startupImage: [], // Có thể thêm ảnh splash screen sau
    },
    formatDetection: {
        telephone: false, // Tắt tự động nhận diện số điện thoại
    },
};

export default async function RootLayout({
    children,
    params: { locale }
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    // Nhận messages để dùng cho Client Components
    const messages = await getMessages();

    return (
        <html lang={locale}>
            <head>
                {/* Material Icons nếu cần */}
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
            </head>
            <body className={`${inter.variable} ${playfair.variable} antialiased font-body bg-[#FAF9F6]`}>
                <QueryProvider>
                    <NextIntlClientProvider messages={messages} locale={locale}>
                        {/* 👇 Bọc TableGuard ở đây để chặn flow nếu chưa chọn bàn */}
                        {/*<TableGuard>*/}
                        {children}
                        {/*</TableGuard>*/}
                    </NextIntlClientProvider>
                </QueryProvider>
            </body>
        </html>
    );
}