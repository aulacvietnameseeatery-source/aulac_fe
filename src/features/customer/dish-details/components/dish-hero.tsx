"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Cloudinary360Viewer } from "@/components/ui/cloudinary-360";
import { Camera, Rotate3d, PlayCircle } from "lucide-react"; // Dùng icon cho giống Figma

type DishHeroProps = {
    onOrderNow: () => void;
    cloudName?: string;
    productTag?: string;
};

export function DishHero({ onOrderNow, cloudName, productTag }: DishHeroProps) {
    const t = useTranslations("DishDetails.Hero");

    // State quản lý chế độ xem: 'photo' | '360' | 'video'
    const [viewMode, setViewMode] = useState<'photo' | '360' | 'video'>('photo');

    const coverImageClasses = "absolute left-0 w-full object-cover top-[-140px] h-[900px] md:top-[-460px] md:h-[1045px]";

    return (
        <section className="mx-auto w-full max-w-[1200px] px-4 pt-10">
            <div className="relative h-[400px] overflow-hidden rounded-2xl shadow-2xl md:h-[561px] bg-[#0D121B]">

                {/* === CONTENT RENDERING === */}
                {viewMode === '360' && productTag ? (
                    <div className={cn(coverImageClasses, "z-10 bg-white")}>
                        <Cloudinary360Viewer
                            cloudName={cloudName || "demo"}
                            productTag={productTag}
                        />
                    </div>
                ) : viewMode === 'video' ? (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 text-white font-serif italic text-2xl">
                        {/* Placeholder cho Video sau này */}
                        Video Presentation Coming Soon...
                    </div>
                ) : (
                    <>
                        <img
                            src="/images/dish-detail/dish-hero/dish-hero.png"
                            alt="Dish hero"
                            className={coverImageClasses}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                    </>
                )}

                {/* === UI OVERLAYS (Chỉ hiện ở mode Photo) === */}
                {viewMode === 'photo' && (
                    <div className="pointer-events-none absolute inset-0 z-10">
                        <div className="absolute left-6 top-[180px] rounded-full bg-blue-700/80 px-4 py-1.5 text-[12px] font-bold uppercase tracking-[1.2px] text-white backdrop-blur-[2px] md:left-16 md:top-[200px] pointer-events-auto font-sans">
                            Chef&apos;s Masterpiece
                        </div>

                        <h1 className="absolute left-6 top-[220px] max-w-[620px] font-serif italic text-5xl font-medium leading-[1] text-white md:left-16 md:top-[240px] md:text-7xl">
                            Imperial Hue<br/>Beef Noodle Soup
                        </h1>

                        <p className="absolute left-6 top-[340px] max-w-[500px] font-sans text-sm font-light leading-relaxed text-white/90 md:left-16 md:top-[400px] md:text-xl md:leading-7">
                            A culinary voyage to the Imperial City of Hue, balancing boldness and refinement in a single bowl.
                        </p>

                        <div className="absolute left-6 bottom-6 flex gap-3 md:left-16 md:top-[488px] md:bottom-auto pointer-events-auto">
                            <button className="h-12 px-8 rounded-lg bg-white shadow-xl flex items-center justify-center gap-2 group transition-all hover:bg-blue-50">
                                <span className="text-base font-bold text-blue-700 font-serif">Reserve Experience</span>
                            </button>
                            <button className="h-12 px-6 rounded-lg bg-black/40 border border-white/20 backdrop-blur-md text-white font-serif font-medium hover:bg-black/60 transition-all">
                                Share
                            </button>
                        </div>
                    </div>
                )}

                {/* Order Button */}
                <button
                    type="button"
                    className="absolute bottom-6 right-6 z-30 h-11 px-6 rounded-lg bg-[#FFAB2D] shadow-lg hover:scale-105 transition-all active:scale-95"
                    onClick={onOrderNow}
                >
                    <span className="text-sm font-bold text-[#1A3A52] font-sans">ORDER NOW</span>
                </button>

                {/* === TABS CONTROL BAR (Chuẩn Figma) === */}
                <div className="absolute left-1/2 top-4 z-40 -translate-x-1/2 flex items-center p-1.5 bg-black/30 border border-white/10 rounded-full backdrop-blur-xl">
                    <TabButton
                        isActive={viewMode === 'photo'}
                        onClick={() => setViewMode('photo')}
                        label="Photo"
                        icon={<Camera size={14} />}
                    />
                    <TabButton
                        isActive={viewMode === '360'}
                        onClick={() => setViewMode('360')}
                        label="360° View"
                        icon={<Rotate3d size={14} />}
                        disabled={!productTag}
                    />
                    <TabButton
                        isActive={viewMode === 'video'}
                        onClick={() => setViewMode('video')}
                        label="Video"
                        icon={<PlayCircle size={14} />}
                    />
                </div>
            </div>
        </section>
    );
}

// Sub-component cho các nút Tab
function TabButton({ isActive, onClick, label, icon, disabled = false }: { isActive: boolean, onClick: () => void, label: string, icon: React.ReactNode, disabled?: boolean }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "flex items-center gap-2 px-6 py-2 rounded-full text-[12px] font-bold uppercase tracking-[1.2px] transition-all duration-300 font-sans",
                isActive
                    ? "bg-white/15 text-white border border-white/20 shadow-lg backdrop-blur-sm"
                    : "text-white/70 hover:text-white",
                disabled && "opacity-30 cursor-not-allowed"
            )}
        >
            <span className={isActive ? "text-white" : "text-white/70"}>{icon}</span>
            {label}
        </button>
    );
}