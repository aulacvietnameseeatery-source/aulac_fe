"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useDynamicSettings } from "../../shared/hooks/useDynamicSettings";

export function IntroHero({ overrides }: { overrides?: Record<string, string> }) {
    const t = useTranslations("Introduction.Hero");
    const { getSetting: originalGetSetting, getMediaSetting } = useDynamicSettings();

    const getSetting = (key: string, fallback: string) => {
        if (overrides?.[key]) return overrides[key];
        return originalGetSetting(key, fallback);
    };

    const title = getSetting("intro.hero.title", t("title"));
    const quote = getSetting("intro.hero.quote", t("quote"));
    const heroImage = getMediaSetting("intro.hero.image", "/images/hero-bg.jpg");

    return (
        <section className="relative w-full min-h-[92dvh] md:min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden">

            {/* 1. BACKGROUND IMAGE - Parallax / Scale Effect */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
                <motion.div
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 10, ease: "easeOut" }}
                    className="w-full h-full"
                >
                    <img
                        src={heroImage}
                        alt="Au Lac Introduction"
                        className="w-full h-full object-cover select-none"
                    />
                </motion.div>
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(8,16,24,0.55),rgba(8,16,24,0.72))]" />
            </div>

            {/* 2. CONTENT */}
            <div className="relative z-10 flex w-full max-w-[1120px] flex-col items-center justify-center px-6 text-center">
                {/* Main Title - Responsive Text Size */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                >
                    <h1 className="font-display text-white text-[42px] sm:text-[62px] md:text-[96px] font-black leading-[1.06] whitespace-pre-line drop-shadow-[0_14px_44px_rgba(0,0,0,0.5)]">
                        {title}
                    </h1>
                </motion.div>

                {/* Quote / Description */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                    className="pt-5 max-w-[92%] md:max-w-[760px]"
                >
                    <p className="font-display text-white/90 text-[15px] md:text-[20px] font-light leading-relaxed italic">
                        {quote}
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

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#EEE8DC] to-transparent" />

        </section>
    );
}