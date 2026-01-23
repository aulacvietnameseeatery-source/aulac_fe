"use client";

import { useEffect, useState } from "react";
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
        let compact = false;

        const onScroll = () => {
            const y = window.scrollY;

            // hysteresis chống rung
            if (!compact && y > 40) {
                compact = true;
                setIsScrolled(true);
            } else if (compact && y < 10) {
                compact = false;
                setIsScrolled(false);
            }
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <div className="flex min-h-screen flex-col bg-[#1A3A52]">
            <Header isScrolled={isScrolled} />

            {/* Spacer đẩy content xuống đúng bằng header */}
            <div
                className={cn(
                    "w-full flex-shrink-0 transition-[height] duration-300 ease-in-out",
                    isScrolled ? "h-[80px]" : "h-[270px]"
                )}
            />

            <main className="flex-1">{children}</main>

            <Footer />
        </div>
    );
}
