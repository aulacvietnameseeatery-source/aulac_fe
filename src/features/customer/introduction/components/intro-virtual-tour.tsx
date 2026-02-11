"use client";

import { Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export function IntroVirtualTour() {
    const t = useTranslations("Introduction.VirtualTour");

    return (
        <section className="w-full bg-[#F6F4EF] py-16 md:py-24 px-6 md:px-8 lg:px-20 flex justify-center">
            <div className="w-full max-w-[1440px] flex flex-col gap-8 md:gap-12">

                {/* --- 1. HEADER SECTION --- */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
                >

                    {/* Title Group */}
                    <div className="flex flex-col gap-2 md:gap-4">
                        <span className="font-display text-[#C9A961] text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] md:tracking-[0.5em]">
                            {t("label")}
                        </span>
                        <h2 className="font-display text-[#0A0A0A] text-[32px] md:text-[36px] font-bold leading-tight">
                            {t("title")}
                        </h2>
                    </div>

                    {/* Description */}
                    <div className="max-w-md">
                        <p className="font-display text-[#0A0A0A]/60 text-sm md:text-[13.6px] leading-relaxed text-justify md:text-left">
                            {t("desc")}
                        </p>
                    </div>
                </motion.div>

                {/* --- 2. VIDEO / IMAGE CONTAINER --- */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="relative w-full p-1 border border-[#C9A961] rounded-[2px]"
                >
                    {/* Aspect Ratio: Mobile dùng 4/5 hoặc square để hiển thị nhiều hơn, Desktop 16/9 */}
                    <div className="relative w-full aspect-[4/5] md:aspect-video lg:h-[804px] overflow-hidden bg-black group cursor-pointer">

                        {/* Background Image */}
                        <img
                            src="/images/introduction-page/intro-virtual-tour/intro-virtual-tour.png"
                            alt="Au Lac Virtual Tour"
                            className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                        />

                        {/* Dark Overlay */}
                        <div className="absolute inset-0 bg-black/20" />

                        {/* --- CENTER PLAY BUTTON --- */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-16 h-16 md:w-20 md:h-20 bg-[#193752]/40 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center transition-colors duration-300 group-hover:bg-[#C9A961]/80"
                            >
                                <Play className="text-white fill-current w-6 h-6 md:w-8 md:h-8 ml-1" />
                            </motion.div>
                        </div>

                        {/* --- BOTTOM LEFT INFO --- */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="absolute bottom-6 left-6 md:bottom-10 md:left-10 flex flex-col gap-1 md:gap-2"
                        >
                            <span className="font-display text-white text-[10px] md:text-xs font-bold uppercase tracking-[0.1em]">
                                {t("tour_label")}
                            </span>
                            <h3 className="font-display text-white text-xl md:text-2xl font-normal">
                                {t("tour_title")}
                            </h3>
                        </motion.div>

                    </div>
                </motion.div>

            </div>
        </section>
    );
}