"use client";

import { useTranslations } from "next-intl";

export function IntroHero() {
    const t = useTranslations("Introduction.Hero");

    return (
        // Sử dụng 100dvh để full màn hình thật sự trên mobile (trừ thanh address bar)
        <section className="relative w-full h-[100dvh] flex flex-col items-center justify-center overflow-hidden">

            {/* 1. BACKGROUND IMAGE */}
            <div className="absolute inset-0 w-full h-full">
                <img
                    src="/images/introduction-page/intro-hero/intro-hero-image.png"
                    alt="Au Lac Introduction"
                    className="w-full h-full object-cover select-none"
                />
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* 2. CONTENT */}
            <div className="relative z-10 flex flex-col items-center justify-center px-6 max-w-[896px] text-center space-y-4 md:space-y-6">

                {/* Est. 1994 */}
                <div className="animate-fade-in-up delay-100">
                    <span className="font-display text-[#C9A961] text-xs md:text-[14px] font-normal uppercase tracking-[0.25em] md:tracking-[5.6px] leading-5">
                        {t("est")}
                    </span>
                </div>

                {/* Main Title - Responsive Text Size */}
                <div className="animate-fade-in-up delay-200">
                    <h1 className="font-display text-white text-[42px] sm:text-[60px] md:text-[96px] font-black leading-[1.1] md:leading-[96px] whitespace-pre-line drop-shadow-lg">
                        {t("title")}
                    </h1>
                </div>

                {/* Quote / Description */}
                <div className="pt-2 animate-fade-in-up delay-300 max-w-[90%] md:max-w-[672px]">
                    <p className="font-display text-white/90 text-[15px] md:text-[19px] font-light leading-relaxed italic">
                        {t("quote")}
                    </p>
                </div>
            </div>

            {/* 3. SCROLL INDICATOR */}
            <div className="absolute bottom-0 flex flex-col items-center animate-fade-in delay-500 pb-[calc(20px+var(--safe-bottom))]">
                <div className="w-[1px] h-[60px] md:h-[96px] bg-gradient-to-b from-white/0 via-white/50 to-white" />
            </div>

        </section>
    );
}