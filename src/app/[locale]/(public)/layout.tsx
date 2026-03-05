"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header/header";
import { Footer } from "@/components/layout/footer/footer";
import { useParams } from "next/navigation";
import { Tooltip } from "react-tooltip";

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
        <div className="flex min-h-screen flex-col bg-[#0f172a]">
            <Header isScrolled={isScrolled} locale={locale} />

            <div className="w-full shrink-0 h-[76px] lg:h-[140px]" />

            <main className="flex-1">{children}</main>
            <Footer locale={locale} />
            <Tooltip id="my-tooltip" style={{zIndex: 10000}}/>
        </div>
    );
}