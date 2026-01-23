import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import QueryProvider from "@/components/providers/query-provider";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Bamee Gasstro - Vietnamese Eatery",
    description: "The pinnacle of Vietnamese culinary art.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className={`${inter.variable} ${playfair.variable} antialiased font-body`}>
        {/* 2. Bọc QueryProvider bao quanh children */}
        <QueryProvider>
            {children}
        </QueryProvider>
        </body>
        </html>
    );
}