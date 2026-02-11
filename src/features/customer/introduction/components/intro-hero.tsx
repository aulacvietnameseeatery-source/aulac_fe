"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export function IntroHero() {
    const t = useTranslations("Introduction.Hero");

    return (
        // Sử dụng 100dvh để full màn hình thật sự trên mobile (trừ thanh address bar)
        <section className="relative w-full h-[100dvh] flex flex-col items-center justify-center overflow-hidden">

            {/* 1. BACKGROUND IMAGE - Parallax / Scale Effect */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
                <motion.div
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 10, ease: "easeOut" }}
                    className="w-full h-full"
                >
                    <img
                        src="/images/introduction-page/intro-hero/intro-hero-image.png"
                        alt="Au Lac Introduction"
                        className="w-full h-full object-cover select-none"
                    />
                </motion.div>
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* 2. CONTENT */}
            <div className="relative z-10 flex flex-col items-center justify-center px-6 max-w-[896px] text-center space-y-4 md:space-y-6">

                {/* Est. 1994 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                >
                    <span className="font-display text-[#C9A961] text-xs md:text-[14px] font-normal uppercase tracking-[0.25em] md:tracking-[5.6px] leading-5">
                        {t("est")}
                    </span>
                </motion.div>

                {/* Main Title - Responsive Text Size */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                >
                    <h1 className="font-display text-white text-[42px] sm:text-[60px] md:text-[96px] font-black leading-[1.1] md:leading-[96px] whitespace-pre-line drop-shadow-lg">
                        {t("title")}
                    </h1>
                </motion.div>

                {/* Quote / Description */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                    className="pt-2 max-w-[90%] md:max-w-[672px]"
                >
                    <p className="font-display text-white/90 text-[15px] md:text-lg font-light leading-relaxed italic">
                        {t("quote")}
                    </p>
                </motion.div>
            </div>

            {/* 3. SCROLL INDICATOR */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.2 }}
                className="absolute bottom-0 flex flex-col items-center pb-[calc(20px+var(--safe-bottom))]"
            >
                <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "60px" }} // Mobile height
                    whileInView={{ height: "96px" }} // Desktop height (responsive override handled via class if needed, but framer usually takes precedence. Let's stick to simple height animation or CSS class with Framer wrapper)
                    transition={{ duration: 1.5, delay: 1.5, ease: "easeInOut" }}
                    className="w-[1px] bg-gradient-to-b from-white/0 via-white/50 to-white"
                    style={{ height: 96 }} // Fallback / default
                />
            </motion.div>

        </section>
    );
}