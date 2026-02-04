"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Cloudinary360Viewer } from "@/components/ui/cloudinary-360";

type DishHeroProps = {
    onOrderNow: () => void;
    cloudName?: string;
    productTag?: string;
};

export function DishHero({ onOrderNow, cloudName, productTag }: DishHeroProps) {
    const t = useTranslations("DishDetails.Hero");

    // State quản lý chế độ xem: 'photo' | '360'
    const [viewMode, setViewMode] = useState<'photo' | '360'>('photo');

    // 👇 CÔNG THỨC CĂN CHỈNH (Magic Numbers):
    // - h-[900px]: Phóng to ảnh (zoom in) để lấp đầy chiều ngang.
    // - top-[-140px]: Kéo ảnh lên trên để lấy phần trung tâm món ăn.
    const coverImageClasses = "absolute left-0 w-full object-cover top-[-140px] h-[900px] md:top-[-460px] md:h-[1045px]";

    return (
        <section className="mx-auto w-full max-w-[1200px] px-4 pt-10">
            {/* Container chính (Khung hiển thị) */}
            <div className="relative h-[360px] overflow-hidden rounded-2xl shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.10)] shadow-xl md:h-[561px] bg-gray-900">

                {/* === PHẦN HIỂN THỊ HÌNH ẢNH / 360 === */}
                {viewMode === '360' && productTag ? (
                    // --- CHẾ ĐỘ 360 ---
                    // 👇 SỬA Ở ĐÂY: Áp dụng class coverImageClasses vào thẻ div bao ngoài
                    <div className={cn(coverImageClasses, "z-10 bg-white")}>
                        {/* Lúc này, cái div này sẽ to hơn cái khung nhìn (h=900px > h=561px).
                            Cloudinary Viewer sẽ render full trong cái div to đùng này.
                            Nhờ top-[-140px], nó sẽ tự động căn đúng vị trí món ăn giống hệt ảnh tĩnh.
                        */}
                        <Cloudinary360Viewer
                            cloudName={cloudName || "demo"}
                            productTag={productTag}
                        />
                    </div>
                ) : (
                    // --- CHẾ ĐỘ ẢNH TĨNH ---
                    <>
                        <img
                            src="/images/dish-detail/dish-hero/dish-hero.png"
                            alt="Dish hero"
                            className={coverImageClasses} // Dùng chung class căn chỉnh
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/20 to-black/0 pointer-events-none" />
                    </>
                )}

                {/* === CÁC THÀNH PHẦN UI (Giữ nguyên) === */}

                {viewMode === 'photo' && (
                    <div className="pointer-events-none absolute inset-0">
                        {/* Tag */}
                        <div className="absolute left-6 top-10 rounded-full bg-blue-800/80 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-[2px] md:left-16 md:top-[200px] pointer-events-auto">
                            {t("tag")}
                        </div>

                        {/* Title */}
                        <h1 className="absolute left-6 top-20 max-w-[620px] text-4xl font-medium leading-[44px] text-white md:left-16 md:top-[240px] md:text-7xl md:leading-[76px]">
                            <span className="block">{t("title_line_1")}</span>
                            <span className="block">{t("title_line_2")}</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="absolute left-6 top-[190px] max-w-[520px] text-base font-light leading-6 text-white/90 md:left-16 md:top-[400px] md:text-xl md:leading-7 whitespace-pre-line">
                            {t("subtitle")}
                        </p>

                        {/* Buttons Action */}
                        <div className="absolute left-6 top-[265px] flex flex-wrap gap-3 md:left-16 md:top-[488px] pointer-events-auto">
                            <button
                                type="button"
                                className="h-12 w-60 rounded-lg bg-white shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.10)] shadow-lg"
                            >
                                <span className="text-base font-bold text-blue-800">
                                    {t("reserve")}
                                </span>
                            </button>

                            <button
                                type="button"
                                className="h-12 w-32 rounded-lg bg-black/40 outline outline-1 outline-offset-[-1px] outline-white/20 backdrop-blur-[6px]"
                            >
                                <span className="text-base font-medium text-white">{t("share")}</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Order Now Button */}
                <button
                    type="button"
                    className="absolute bottom-6 right-6 z-20 h-11 w-28 rounded-lg bg-amber-400 md:right-[150px] md:top-[492px] md:bottom-auto shadow-lg hover:bg-amber-500 transition-colors"
                    onClick={onOrderNow}
                >
                    <span className="text-sm font-medium text-blue-950">{t("order_now")}</span>
                </button>

                {/* Control Bar */}
                {productTag && (
                    <div className="absolute left-1/2 top-4 z-20 hidden -translate-x-1/2 items-center gap-2 rounded-full bg-black/30 p-1.5 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-md md:inline-flex">
                        <button
                            type="button"
                            onClick={() => setViewMode('photo')}
                            className={cn(
                                "rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all",
                                viewMode === 'photo'
                                    ? "bg-white/20 text-white outline outline-1 outline-offset-[-1px] outline-white/20 shadow-lg"
                                    : "text-white/70 hover:text-white"
                            )}
                        >
                            {t("photo")}
                        </button>

                        <button
                            type="button"
                            onClick={() => setViewMode('360')}
                            className={cn(
                                "rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all",
                                viewMode === '360'
                                    ? "bg-white/20 text-white outline outline-1 outline-offset-[-1px] outline-white/20 shadow-lg"
                                    : "text-white/70 hover:text-white"
                            )}
                        >
                            {t("view_360")}
                        </button>

                        <button
                            type="button"
                            className="rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white/70 cursor-not-allowed opacity-50"
                        >
                            {t("video")}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}