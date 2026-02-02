"use client";

import Image from "next/image";
import { useTranslations } from "next-intl"; // Import hook

export function HeroSection() {
    const t = useTranslations("QrScan.HeroSection"); // Khởi tạo hook

    return (
        <div className="relative h-[400px] w-full lg:h-full lg:min-h-[600px] overflow-hidden">
            <Image
                src="/images/qr-scan/hero-section/Diner.png"
                alt="Atmosphere"
                fill
                className="object-cover transition-transform duration-1000 hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#0F151C]/90 via-[#0F151C]/20 to-transparent" />

            <div className="absolute bottom-16 left-12 right-12 flex flex-col gap-4">
                <span className="inline-block font-sans text-[11px] font-bold uppercase tracking-[4px] text-[#C5A059]">
                  {t("label")}
                </span>
                <blockquote className="font-display text-[28px] font-normal italic leading-[40px] text-white/90 lg:text-[32px]">
                    {t("quote")}
                </blockquote>
            </div>
        </div>
    );
}