"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl"; // Import hook

export function IntroHero() {
    const t = useTranslations("Introduction.Hero"); // Khởi tạo hook

    return (
        <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">

            {/* 1. BACKGROUND IMAGE */}
            <div className="absolute inset-0 w-full h-full">

                <img
                    src="/images/introduction-page/intro-hero/intro-hero-image.png"
                    alt="Au Lac Introduction"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* 2. CONTENT */}
            <div className="relative z-10 flex flex-col items-center justify-center px-4 max-w-[896px] text-center space-y-6">

                {/* Est. 1994 */}
                <div className="animate-fade-in-up delay-100">
                    <span className="font-display text-[#C9A961] text-sm md:text-[14px] font-normal uppercase tracking-[0.4em] md:tracking-[5.6px] leading-5">
                        {t("est")}
                    </span>
                </div>

                {/* Main Title */}
                <div className="animate-fade-in-up delay-200">
                    <h1 className="font-display text-white text-[50px] md:text-[96px] font-black leading-[1.1] md:leading-[96px]">
                        {/* Dùng t.rich để render các thẻ <br /> */}
                        {t.rich("title", {
                            br: () => <br/>
                        })}
                    </h1>
                </div>

                {/* Quote / Description */}
                <div className="pt-2 animate-fade-in-up delay-300 max-w-[672px]">
                    <p className="font-display text-white/90 text-[16px] md:text-[19px] font-light leading-7 md:leading-7 italic">
                        {t("quote")}
                    </p>
                </div>
            </div>

            {/* 3. SCROLL INDICATOR (Cái gạch dọc ở dưới) */}
            <div className="absolute bottom-0 flex flex-col items-center animate-fade-in delay-500">
                <div className="w-[1px] h-[96px] bg-gradient-to-b from-white/0 via-white/50 to-white" />
            </div>

        </section>
    );
}