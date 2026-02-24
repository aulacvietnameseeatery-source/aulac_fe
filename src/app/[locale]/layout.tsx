import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import QueryProvider from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/providers/auth-provider";

import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#FAF9F6",
};

export async function generateMetadata(
    { params }: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale } = await params;
  const messages = await getMessages({ locale });

  return {
    title: (messages as any).Metadata?.title ?? "An Lac",
    description: (messages as any).Metadata?.description ?? "Vietnamese Eatery",
  };
}

export default async function LocaleLayout(
    props: {
      children: ReactNode;
      params: Promise<{ locale: string }>;
    }
): Promise<ReactNode> {
  const { children } = props;
  const { locale } = await props.params;

  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <body className="antialiased">
        <QueryProvider>
          <AuthProvider>
            <NextIntlClientProvider locale={locale} messages={messages}>
              {children}
              <Toaster />
            </NextIntlClientProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}