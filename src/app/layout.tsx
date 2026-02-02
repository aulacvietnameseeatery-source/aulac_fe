import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import QueryProvider from "@/components/providers/query-provider";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });

import type { Viewport } from 'next';

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false, 
    viewportFit: 'cover',
};

export const metadata: Metadata = {
    title: "Bamee Gasstro - Vietnamese Eatery",
    description: "The pinnacle of Vietnamese culinary art.",
};

export default async function RootLayout({
                                             children,
                                             params: { locale }
                                         }: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    // Đảm bảo locale hợp lệ
    //const locales = ['en', 'fr'];
    //if (!locales.includes(locale)) notFound();

    // Nhận messages để dùng cho Client Components
    const messages = await getMessages();

    return (
        <html lang={locale}>
        <head>
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        </head>
        <body className={`${inter.variable} ${playfair.variable} antialiased font-body`}>
        <QueryProvider>
            <NextIntlClientProvider messages={messages} locale={locale}>
                {children}
            </NextIntlClientProvider>
        </QueryProvider>
        </body>
        </html>
    );
}