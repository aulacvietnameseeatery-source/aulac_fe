"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useDynamicSettings } from "../../shared/hooks/useDynamicSettings";

export function IntroVirtualTour({ overrides }: { overrides?: Record<string, string> }) {
    const t = useTranslations("Introduction.VirtualTour");
    const { getSetting: originalGetSetting, getMediaSetting } = useDynamicSettings();

    const getSetting = (key: string, fallback: string) => {
        if (overrides?.[key]) return overrides[key];
        return originalGetSetting(key, fallback);
    };

    const label = getSetting("intro.virtualTour.label", t("label"));
    const title = getSetting("intro.virtualTour.title", t("title"));
    const desc = getSetting("intro.virtualTour.desc", t("desc"));
    const videoUrl = getMediaSetting("intro.virtualTour.videoUrl", "/video/nha-hang.mp4");

    return (
        <section className="w-full bg-transparent py-20 md:py-28 px-6 md:px-8 lg:px-20 flex justify-center">
            <div className="w-full max-w-[1440px] rounded-3xl bg-[#13283A] p-6 md:p-10 lg:p-12 shadow-[0_24px_64px_rgba(10,22,32,0.2)]">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col gap-4 md:gap-6"
                    >
                        <span className="font-display text-[#D5BE8A] text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] md:tracking-[0.5em]">
                            {label}
                        </span>
                        <h2 className="font-display text-white text-[32px] md:text-[42px] font-bold leading-tight">
                            {title}
                        </h2>
                        <p className="max-w-xl font-display text-white/75 text-sm md:text-[14px] leading-relaxed text-justify md:text-left">
                            {desc}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: 0.1 }}
                        className="relative flex w-full justify-center"
                    >
                        <div className="relative inline-flex overflow-hidden rounded-2xl border border-white/20">
                            <video
                                src={videoUrl}
                                autoPlay
                                muted
                                loop
                                playsInline
                                className="block h-auto max-h-[440px] w-auto max-w-full"
                            />
                        </div>
                    </motion.div>
                </div>

            </div>
        </section>
    );
}