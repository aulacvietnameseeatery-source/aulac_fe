"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export function IntroCollection() {
    const t = useTranslations("Introduction.Collection");

    const COLLECTION_ITEMS = [
        {
            id: 1,
            image: "/images/introduction-page/intro-collection/intro-collection-dish1.png",
            hoverCategory: t("dish_1_category"),
            hoverTitle: t("dish_1_title"),
            hoverDesc: t("dish_1_desc"),
            mainTitle: t("dish_1_main"),
            subTitle: t("dish_1_sub"),
        },
        {
            id: 2,
            image: "/images/introduction-page/intro-collection/intro-collection-dish2.png",
            hoverCategory: t("dish_2_category"),
            hoverTitle: t("dish_2_title"),
            hoverDesc: t("dish_2_desc"),
            mainTitle: t("dish_2_main"),
            subTitle: t("dish_2_sub"),
        },
        {
            id: 3,
            image: "/images/introduction-page/intro-collection/intro-collection-dish3.png",
            hoverCategory: t("dish_3_category"),
            hoverTitle: t("dish_3_title"),
            hoverDesc: t("dish_3_desc"),
            mainTitle: t("dish_3_main"),
            subTitle: t("dish_3_sub"),
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" as const }
        }
    };

    return (
        <section className="w-full bg-transparent py-20 md:py-28 px-6 md:px-8 lg:px-20 flex justify-center">
            <div className="w-full max-w-[1440px] flex flex-col gap-12 md:gap-20">

                {/* --- HEADER --- */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col items-center text-center space-y-3 md:space-y-4"
                >
                    <div className="flex flex-col items-center gap-2">
                        <span className="font-display text-[#8D6A2A] text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] md:tracking-[0.5em]">
                            {t("label")}
                        </span>
                        <h2 className="font-display text-[#12283A] text-[34px] md:text-5xl font-bold leading-tight">
                            {t("title")}
                        </h2>
                    </div>
                    {/* Decorative Spacer */}
                    <div className="w-12 h-px bg-[#C9A961]/30 md:w-16 md:h-8 md:bg-transparent" />
                </motion.div>

                {/* --- GRID ITEMS --- */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-8"
                >
                    {COLLECTION_ITEMS.map((item) => (
                        <motion.div
                            key={item.id}
                            variants={itemVariants}
                            className="group cursor-pointer rounded-2xl border border-[#C9A961]/25 bg-[#F7F1E5]/70 p-4 md:p-5 backdrop-blur-sm"
                        >

                            {/* IMAGE CARD */}
                            <div className="relative w-full aspect-[3/4] overflow-hidden rounded-xl border border-[#C9A961]/25 bg-[#193752]/10">
                                <img
                                    src={item.image}
                                    alt={item.mainTitle}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />

                                {/* Overlay: Mobile -> Tap to see, Desktop -> Hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#12283A]/95 via-[#12283A]/65 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6 md:p-8">
                                    <span className="font-display text-[#C9A961] text-[10px] md:text-xs uppercase tracking-widest mb-1 md:mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                                        {item.hoverCategory}
                                    </span>
                                    <h3 className="font-display text-white text-xl md:text-2xl font-bold mb-1 md:mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                                        {item.hoverTitle}
                                    </h3>
                                    <p className="font-display text-white/80 text-xs md:text-sm leading-relaxed translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-150 line-clamp-3">
                                        {item.hoverDesc}
                                    </p>
                                </div>
                            </div>

                            {/* TEXT INFO */}
                            <div className="mt-4 flex flex-col items-center text-center space-y-1 md:space-y-2">
                                <h4 className="font-display text-[#8D6A2A] text-[16px] md:text-lg font-semibold">
                                    {item.mainTitle}
                                </h4>
                                <span className="font-display text-[#12283A] text-xs md:text-sm uppercase tracking-widest">
                                    {item.subTitle}
                                </span>
                            </div>

                        </motion.div>
                    ))}
                </motion.div>

            </div>
        </section>
    );
}