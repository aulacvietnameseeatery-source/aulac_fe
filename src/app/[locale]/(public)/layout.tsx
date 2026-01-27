"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header/header";
import { Footer } from "@/components/layout/footer/footer";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const params = useParams();
    const locale = params.locale as string;

    useEffect(() => {
        const onScroll = () => {
            const y = window.scrollY;
            if (y > 40) setIsScrolled(true);
            else if (y < 10) setIsScrolled(false);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <div className="flex min-h-screen flex-col bg-[#1A3A52]">
            {/* Truyền locale vào Header để handle link chuyển trang */}
            <Header isScrolled={isScrolled} locale={locale} />

            <div className={cn(
                "w-full flex-shrink-0 transition-[height] duration-300 ease-in-out",
                isScrolled ? "h-[80px]" : "h-[270px]"
            )} />

            <main className="flex-1">{children}</main>
            <Footer locale={locale} />
        </div>
    );
}