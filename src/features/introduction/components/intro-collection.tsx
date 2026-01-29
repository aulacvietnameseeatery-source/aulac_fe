"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl"; // Import hook

export function IntroCollection() {
    const t = useTranslations("Introduction.Collection"); // Khởi tạo hook

    // Đưa mảng COLLECTION_ITEMS vào trong component để dùng được 't'
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

    return (
        <section className="w-full bg-[#F6F4EF] py-24 px-4 md:px-8 lg:px-20 flex justify-center">
            <div className="w-full max-w-[1440px] flex flex-col gap-20">

                {/* --- HEADER --- */}
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="flex flex-col items-center gap-2">
                        <span className="font-display text-[#C9A961] text-xs font-bold uppercase tracking-[0.5em]">
                            {t("label")}
                        </span>
                        <h2 className="font-display text-[#0A0A0A] text-4xl md:text-5xl font-bold leading-tight">
                            {t("title")}
                        </h2>
                    </div>
                    {/* Decorative Spacer */}
                    <div className="w-16 h-8" />
                </div>

                {/* --- GRID ITEMS --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {COLLECTION_ITEMS.map((item) => (
                        <div key={item.id} className="flex flex-col gap-6 group cursor-pointer">

                            {/* IMAGE CARD (Có hiệu ứng Hover) */}
                            <div className="relative w-full aspect-[3/4] overflow-hidden rounded-[4px] border border-[#C9A961]/20 bg-[#193752]/10">
                                <img
                                    src={item.image}
                                    alt={item.mainTitle}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />

                                {/* Overlay: Hiện ra khi hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#193752]/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                                    <span className="font-display text-[#C9A961] text-xs uppercase tracking-widest mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                                        {item.hoverCategory}
                                    </span>
                                    <h3 className="font-display text-white text-2xl font-bold mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                                        {item.hoverTitle}
                                    </h3>
                                    <p className="font-display text-white/80 text-sm leading-relaxed translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-150">
                                        {item.hoverDesc}
                                    </p>
                                </div>
                            </div>

                            {/* TEXT INFO (Bên dưới ảnh) */}
                            <div className="flex flex-col items-center text-center space-y-2">
                                <h4 className="font-display text-[#C9A961] text-lg font-medium">
                                    {item.mainTitle}
                                </h4>
                                <span className="font-display text-[#0A0A0A] text-sm uppercase tracking-widest">
                                    {item.subTitle}
                                </span>
                            </div>

                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}