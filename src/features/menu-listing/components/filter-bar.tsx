"use client";

import { cn } from "@/lib/utils";
import { useRef } from "react";

interface FilterBarProps {
    categories: string[];
    activeCategory: string;
    onSelect: (category: string) => void;
    isScrolled: boolean; // 👈 1. Thêm cái này
}

export function FilterBar({
                              categories,
                              activeCategory,
                              onSelect,
                              isScrolled // 👈 2. Nhận props
                          }: FilterBarProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    return (
        <div
            className={cn(
                "sticky z-40 w-full border-b border-[#E8E4DF]",

                "transition-all duration-300 ease-in-out will-change-[top]",
                isScrolled ? "top-[80px]" : "top-[270px]",

                "bg-[#FAF9F6]"
            )}
        >
            <div
                ref={scrollContainerRef}
                className="mx-auto flex w-full max-w-[1280px] items-center gap-3 overflow-x-auto px-4 py-4 md:justify-center no-scrollbar scroll-smooth"
            >
                {categories.map((category) => {
                    const isActive = activeCategory === category;
                    return (
                        <button
                            key={category}
                            onClick={() => onSelect(category)}
                            className={cn(
                                "flex-shrink-0 rounded-full px-6 py-2 text-[14px] font-medium transition-all duration-300",
                                isActive
                                    ? "bg-[#1A3A52] text-white border border-[#1A3A52] shadow-md transform scale-105"
                                    : "bg-white text-[#0A0A0A] border border-[#E8E4DF] hover:border-[#1A3A52] hover:text-[#1A3A52]"
                            )}
                        >
                            {category}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}