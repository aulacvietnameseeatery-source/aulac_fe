"use client";

import { cn } from "@/lib/utils";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react"; // Import icon Search

interface FilterBarProps {
    categories: string[];
    activeCategory: string;
    onSelect: (category: string) => void;
    isScrolled: boolean;
    // 👇 Thêm props cho search
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export function FilterBar({
                              categories,
                              activeCategory,
                              onSelect,
                              isScrolled,
                              searchQuery,
                              onSearchChange
                          }: FilterBarProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const t = useTranslations("MenuListing.FilterBar");

    return (
        <div
            className={cn(
                "sticky z-40 w-full border-b border-[#E8E4DF] bg-[#FAF9F6]",
                "transition-all duration-300 ease-in-out will-change-[top]",
                // Khi scroll thì padding nhỏ lại một chút cho gọn
                isScrolled ? "top-[80px] py-2" : "top-[270px] py-4"
            )}
        >
            <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-4 px-4 md:items-center">

                {/* === 1. SEARCH BAR (Mới) === */}
                <div className={cn(
                    "relative w-full transition-all duration-300",
                    // Trên desktop thì giới hạn chiều rộng cho đẹp (max-w-md)
                    "md:max-w-md"
                )}>
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <Search className="h-4 w-4 text-[#C5A059]" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder={t("search_placeholder")}
                        className={cn(
                            "w-full rounded-full border border-[#E8E4DF] bg-white py-2.5 pl-11 pr-4 text-sm text-[#1A3A52] placeholder:text-[#1A3A52]/40",
                            "focus:border-[#C5A059] focus:outline-none focus:ring-1 focus:ring-[#C5A059]",
                            "transition-all shadow-sm hover:shadow-md"
                        )}
                    />
                </div>

                {/* === 2. CATEGORIES (Giữ nguyên logic cũ) === */}
                <div
                    ref={scrollContainerRef}
                    className="flex w-full items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth md:justify-center pb-2 md:pb-0 overflow-y-hidden"

                >
                    {categories.map((category) => {
                        const isActive = activeCategory === category;
                        // Xử lý key i18n
                        const label = t(category.toLowerCase() as any);

                        return (
                            <button
                                key={category}
                                onClick={() => onSelect(category)}
                                className={cn(
                                    "flex-shrink-0 rounded-full px-6 py-2 text-[14px] font-medium transition-all duration-300 whitespace-nowrap",
                                    isActive
                                        ? "bg-[#1A3A52] text-white border border-[#1A3A52] shadow-md transform scale-105"
                                        : "bg-white text-[#0A0A0A] border border-[#E8E4DF] hover:border-[#1A3A52] hover:text-[#1A3A52]"
                                )}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}