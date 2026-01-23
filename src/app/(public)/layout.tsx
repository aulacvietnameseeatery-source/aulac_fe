"use client"; // 👈 Quan trọng: Biến Layout thành Client Component để bắt sự kiện cuộn

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header/header";
import { Footer } from "@/components/layout/footer/footer";
import { cn } from "@/lib/utils";

export default function PublicLayout({
                                         children,
                                     }: {
    children: React.ReactNode;
}) {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    setIsScrolled(window.scrollY > 1);
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="flex min-h-screen flex-col bg-[#1A3A52]">

            <Header isScrolled={isScrolled} />
            <div
                className={cn(
                    "w-full bg-[#1A3A52] flex-shrink-0 transition-all duration-120 ease-in-out",
                    isScrolled ? "h-[80px]" : "h-[270px]"
                )}
            />

            <main className="flex-1">
                {children}
            </main>

            <Footer />
        </div>
    );
}