"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useDynamicSettings } from "../../shared/hooks/useDynamicSettings";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettingMedia } from "../../shared/hooks/useSettingMedia";

function CollectionCard({
    item,
    itemVariants,
    isSettingsLoading,
}: {
    item: {
        id: number;
        image: string;
        cardCategory: string;
        cardTitle: string;
        mainTitle: string;
    };
    itemVariants: {
        hidden: { opacity: number; y: number };
        visible: {
            opacity: number;
            y: number;
            transition: { duration: number; ease: "easeOut" };
        };
    };
    isSettingsLoading: boolean;
}) {
    const media = useSettingMedia(item.image, isSettingsLoading);

    return (
        <motion.div
            variants={itemVariants}
            className="group cursor-pointer rounded-2xl border border-[#C9A961]/25 bg-[#F7F1E5]/70 p-4 md:p-5 backdrop-blur-sm"
        >
            <div className="relative w-full aspect-[3/4] overflow-hidden rounded-xl border border-[#C9A961]/25 bg-[#193752]/10">
                {media.showSkeleton && (
                    <Skeleton className="absolute inset-0 h-full w-full rounded-none bg-[#193752]/15" />
                )}
                {media.hasSource && (
                    <img
                        src={media.mediaSrc}
                        alt={item.mainTitle}
                        className={`h-full w-full object-cover transition-all duration-700 group-hover:scale-110 ${media.showSkeleton ? "opacity-0" : "opacity-100"}`}
                        onLoad={media.handleLoad}
                        onError={media.handleError}
                    />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[#12283A]/95 via-[#12283A]/65 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6 md:p-8">
                    <span className="font-display text-[#C9A961] text-[10px] md:text-xs uppercase tracking-widest mb-1 md:mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                        {item.cardCategory}
                    </span>
                    <h3 className="font-display text-white text-xl md:text-2xl font-bold mb-1 md:mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                        {item.cardTitle}
                    </h3>
                </div>
            </div>

            <div className="mt-4 flex flex-col items-center text-center space-y-1 md:space-y-2">
                <h4 className="font-display text-[#8D6A2A] text-[16px] md:text-lg font-semibold">
                    {item.mainTitle}
                </h4>
            </div>
        </motion.div>
    );
}

export function IntroCollection({ overrides }: { overrides?: Record<string, string> }) {
    const t = useTranslations("Introduction.Collection");
    const { getSetting: originalGetSetting, getMediaSetting, isLoading } = useDynamicSettings();

    const getSetting = (key: string, fallback: string) => {
        if (overrides?.[key]) return overrides[key];
        return originalGetSetting(key, fallback);
    };

    const label = getSetting("intro.collection.label", t("label"));
    const title = getSetting("intro.collection.title", t("title"));
    const showTextSkeleton = isLoading && !overrides;

    const COLLECTION_ITEMS = [
        {
            id: 1,
            image: getMediaSetting("intro.collection.dish1.image", ""),
            cardCategory: getSetting("intro.collection.dish1.cardCategory", t("dish_1_category")),
            cardTitle: getSetting("intro.collection.dish1.cardTitle", t("dish_1_title")),
            mainTitle: getSetting("intro.collection.dish1.mainTitle", t("dish_1_main")),
        },
        {
            id: 2,
            image: getMediaSetting("intro.collection.dish2.image", ""),
            cardCategory: getSetting("intro.collection.dish2.cardCategory", t("dish_2_category")),
            cardTitle: getSetting("intro.collection.dish2.cardTitle", t("dish_2_title")),
            mainTitle: getSetting("intro.collection.dish2.mainTitle", t("dish_2_main")),
        },
        {
            id: 3,
            image: getMediaSetting("intro.collection.dish3.image", ""),
            cardCategory: getSetting("intro.collection.dish3.cardCategory", t("dish_3_category")),
            cardTitle: getSetting("intro.collection.dish3.cardTitle", t("dish_3_title")),
            mainTitle: getSetting("intro.collection.dish3.mainTitle", t("dish_3_main")),
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
                    {showTextSkeleton ? (
                        <div className="flex flex-col items-center gap-3">
                            <Skeleton className="h-3 w-28 bg-[#C9A961]/20" />
                            <Skeleton className="h-10 w-[min(90vw,420px)] bg-[#12283A]/10" />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <span className="font-display text-[#8D6A2A] text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] md:tracking-[0.5em]">
                                {label}
                            </span>
                            <h2 className="font-display text-[#12283A] text-[34px] md:text-5xl font-bold leading-tight">
                                {title}
                            </h2>
                        </div>
                    )}
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
                        <CollectionCard
                            key={item.id}
                            item={item}
                            itemVariants={itemVariants}
                            isSettingsLoading={isLoading}
                        />
                    ))}
                </motion.div>

            </div>
        </section>
    );
}
