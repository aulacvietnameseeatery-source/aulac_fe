"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DishDetailModal } from "@/features/customer/dish-details";

import { useLandingPageSettings } from "@/hooks/use-landing-page-settings";

export interface MenuItem {
    id: string;
    price: number;
    image: string;
    category: string;
    translationKey: string;
    tagColor?: "default" | "gold" | "dark";
    element?: string;
}

// Interface này khớp với page.tsx
export interface OrderEvent {
    item: MenuItem;
    startPos: { x: number; y: number; img: string };
}

interface MenuCardProps {
    item: MenuItem;
    onOrder?: (event: OrderEvent) => void;
}

export function MenuCard({ item, onOrder }: MenuCardProps) {
    const tGrid = useTranslations("MenuListing.MenuGrid");
    const tFilter = useTranslations("MenuListing.FilterBar");
    const locale = useLocale() as "en" | "fr";
    const { data: settings } = useLandingPageSettings();
    const showDishImage = settings?.showDishImage ?? true;

    const [isAdded, setIsAdded] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOrderClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsAdded(true);
        const rect = (e.target as HTMLElement).getBoundingClientRect();

        // Gửi đúng cấu trúc OrderEvent
        onOrder?.({
            item,
            startPos: {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
                img: item.image
            }
        });

        setTimeout(() => setIsAdded(false), 2000);
    };

    const handleCardClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsModalOpen(true);
    };

    const name = tGrid(`items.${item.translationKey}_name` as never);
    const description = tGrid(`items.${item.translationKey}_desc` as never);

    let categoryLabel = item.category;
    try { categoryLabel = tFilter(item.category.toLowerCase() as never); } catch { }

    return (
        <motion.div
            // Hiệu ứng Plate Lift
            animate={{
                y: isAdded ? -6 : 0,
                boxShadow: isAdded
                    ? "0 20px 40px -10px rgba(212, 165, 116, 0.4)" // Bóng vàng lan tỏa đẹp hơn
                    : "0 4px 12px -4px rgba(0,0,0,0.1)"
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-[#E8E4DF]"
        >
            {/* Image - Click to open modal */}
            {showDishImage && (
                <div
                    onClick={handleCardClick}
                    className="relative h-[224px] w-full bg-[#F5F3F0] overflow-hidden cursor-pointer"
                >
                    <Image
                        width={1920}
                        height={1080}
                        src={item.image}
                        alt={name}
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="absolute left-4 top-4 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1.5 shadow-sm">
                        <span className="block text-[11px] font-bold uppercase tracking-[0.5px] text-[#1A3A52]">
                            {categoryLabel}
                        </span>
                    </div>
                </div>
            )}

            <div className="flex flex-1 flex-col p-6">
                <div
                    onClick={handleCardClick}
                    className="block mb-2 cursor-pointer"
                >
                    <h3 className="font-display text-[20px] font-bold leading-[28px] text-[#0A0A0A] transition-colors hover:text-[#D4A574]">
                        {name}
                    </h3>
                </div>

                <p className="mb-6 line-clamp-3 flex-1 font-body text-[14px] leading-[22px] text-[#7A7A7A]">
                    {description}
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-[#E8E4DF]/60 pt-6">
                    <span className="font-display text-[22px] font-bold text-[#D4A574]">
                        ${item.price}
                    </span>

                    {/* === NÚT ORDER "XỊN" (PREMIUM BUTTON) === */}
                    <motion.button
                        onClick={handleOrderClick}
                        whileTap={{ scale: 0.96 }}
                        className="relative overflow-hidden rounded-full shadow-sm outline-none group/btn"
                    >
                        {/* Background Layer: Gradient Gold hoặc Navy */}
                        <motion.div
                            className="absolute inset-0 z-0"
                            animate={{
                                opacity: 1,
                                background: isAdded
                                    ? "linear-gradient(135deg, #1A3A52 0%, #204560 100%)" // Navy Gradient
                                    : "linear-gradient(135deg, #D4A574 0%, #C39462 100%)" // Gold Gradient
                            }}
                        />

                        {/* Shine Effect (Vệt sáng chạy qua khi chưa add) */}
                        {!isAdded && (
                            <div className="absolute inset-0 z-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] transition-transform duration-1000 group-hover/btn:translate-x-[150%]" />
                        )}

                        {/* Content Layer */}
                        <div className="relative z-10 px-6 py-2.5">
                            <AnimatePresence mode="wait" initial={false}>
                                {isAdded ? (
                                    <motion.span
                                        key="added"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="flex items-center justify-center gap-1.5 font-display text-[13px] font-bold uppercase tracking-[1px] text-white"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                        Added
                                    </motion.span>
                                ) : (
                                    <motion.span
                                        key="order"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="block font-display text-[13px] font-bold uppercase tracking-[1px] text-[#1A3A52]"
                                    >
                                        {tGrid("order_btn")}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.button>
                </div>
            </div>

            {/* Dish Detail Modal */}
            <DishDetailModal
                dishId={isModalOpen ? parseInt(item.id) : null}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </motion.div>
    );
}