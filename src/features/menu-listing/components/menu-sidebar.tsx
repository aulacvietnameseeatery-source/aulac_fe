"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    LayoutGrid, Utensils, ChefHat, Fish,
    IceCream, Coffee, Pizza, ChevronRight, Menu
} from "lucide-react";

interface MenuSidebarProps {
    categories: string[];
    activeCategory: string;
    onSelectCategory: (category: string) => void;
}

const getIcon = (category: string) => {
    switch (category) {
        case "All": return <LayoutGrid size={20} />;
        case "Appetizers": return <Utensils size={20} />;
        case "Main Course": return <ChefHat size={20} />;
        case "Seafood": return <Fish size={20} />;
        case "Desserts": return <IceCream size={20} />;
        case "Beverages": return <Coffee size={20} />;
        case "Italian": return <Pizza size={20} />;
        default: return <Utensils size={20} />;
    }
};

export function MenuSidebar({ categories, activeCategory, onSelectCategory }: MenuSidebarProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <aside
            className={cn(
                "flex flex-col bg-white rounded-xl shadow-lg border border-[#E8E4DF] transition-all duration-300 ease-in-out overflow-hidden",
                // Khi mở rộng thì đẩy sang trái (absolute positioning trick bên ngoài lo việc này)
                isExpanded ? "w-[200px]" : "w-[60px]"
            )}
        >
            {/* Nút Toggle */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-14 w-full flex items-center justify-center border-b border-[#E8E4DF] hover:bg-[#FAF9F6] text-[#1A3A52] transition-colors"
            >
                {isExpanded ? (
                    <div className="flex items-center w-full px-4 justify-between">
                        <span className="font-display font-bold text-xs uppercase tracking-widest text-[#D4A574]">Menu</span>
                        <ChevronRight size={16} className="rotate-180 text-[#1A3A52]/50" />
                    </div>
                ) : (
                    <Menu size={22} className="text-[#1A3A52]" />
                )}
            </button>

            {/* Danh sách */}
            <div className="flex flex-col py-2 gap-1">
                {categories.map((cat) => {
                    const isActive = activeCategory === cat;
                    return (
                        <button
                            key={cat}
                            onClick={() => onSelectCategory(cat)}
                            className={cn(
                                "relative h-11 flex items-center transition-all duration-200 mx-1 rounded-lg group",
                                isActive
                                    ? "bg-[#1A3A52] text-white shadow-sm"
                                    : "text-[#1A3A52]/70 hover:text-[#D4A574] hover:bg-[#FAF9F6]",
                                isExpanded ? "px-3 justify-start" : "justify-center px-0"
                            )}
                            title={cat}
                        >
                            <div className={cn("flex-shrink-0 transition-transform duration-200", isActive ? "scale-110" : "group-hover:scale-110")}>
                                {getIcon(cat)}
                            </div>

                            <span className={cn(
                                "ml-3 font-display text-[14px] font-medium whitespace-nowrap overflow-hidden transition-all duration-300",
                                isExpanded ? "opacity-100 max-w-[140px]" : "opacity-0 max-w-0"
                            )}>
                                {cat}
                            </span>
                        </button>
                    );
                })}
            </div>
        </aside>
    );
}