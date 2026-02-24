import type { Metadata } from "next";
import type { ReactNode } from "react";
import { inter, playfair, lexend } from "@/lib/fonts";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import QueryProvider from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/providers/auth-provider";

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale } = await params;
  const messages = await getMessages({ locale });

  return {
    title: (messages as any).Metadata?.title ?? "Au Lac",
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
      <body className={`${inter.variable} ${playfair.variable} ${lexend.variable} antialiased`}>
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