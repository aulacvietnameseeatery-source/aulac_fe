import type { Viewport } from "next";
import type { ReactNode } from "react";
import "@/styles/globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#FAF9F6",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}