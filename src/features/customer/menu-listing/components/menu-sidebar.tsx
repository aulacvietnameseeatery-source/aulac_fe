"use client";

import { cn } from "@/lib/utils";
import {
    Utensils, ChefHat,
    IceCream, Coffee,
    // Các icon khác nếu cần
} from "lucide-react";

// Định nghĩa cấu trúc Course khớp với MenuGrid của bạn
interface Course {
    id: string;
    label: string; // Theo code bạn gửi thì label là string, không phải {en, fr}
}

interface MenuSidebarProps {
    courses: Course[]; // Nhận danh sách này từ Page truyền xuống
    activeCourse: string;
    onSelectCourse: (id: string) => void;
}

// Map icon dựa trên ID trong MenuGrid của bạn
const getIcon = (id: string) => {
    switch (id) {
        case "starters": return <Utensils size={24} />;
        case "main": return <ChefHat size={24} />;
        case "dessert": return <IceCream size={24} />;
        case "beverage": return <Coffee size={24} />;
        // Fallback cho các trường hợp khác
        default: return <Utensils size={24} />;
    }
};

export function MenuSidebar({ courses, activeCourse, onSelectCourse }: MenuSidebarProps) {
    return (
        <aside className="flex flex-col w-60 py-2">
            <div className="flex flex-col gap-3">
                {courses.map((course) => {
                    const isActive = activeCourse === course.id;
                    return (
                        <button
                            key={course.id}
                            onClick={() => onSelectCourse(course.id)}
                            className={cn(
                                "group flex items-center h-12 rounded-r-full transition-all duration-500 ease-out pl-5 relative overflow-hidden",
                                // LOGIC GIAO DIỆN (Giữ nguyên thiết kế của bạn):
                                // - Active: Nền Navy + Dịch phải
                                // - Inactive: Nền trong suốt
                                isActive
                                    ? "bg-[#1A3A52] shadow-lg translate-x-2"
                                    : "bg-transparent hover:translate-x-1"
                            )}
                        >
                            {/* ICON */}
                            <div className={cn(
                                "z-10 transition-all duration-500 flex-shrink-0",
                                // Active: Vàng Gold, Inactive: Navy
                                isActive
                                    ? "text-[#D4A574] scale-110"
                                    : "text-[#1A3A52] group-hover:scale-110"
                            )}>
                                {getIcon(course.id)}
                            </div>

                            {/* LABEL (Hiệu ứng tàng hình) */}
                            <span className={cn(
                                "ml-4 font-display text-[14px] font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-500",
                                // 1. Màu mặc định trùng màu nền web (#FAF9F6) -> Ẩn
                                "text-[#FAF9F6]",
                                // 2. Khi Active: Hiện rõ (trên nền Navy)
                                // 3. Khi Hover: Đổi màu thành Navy để hiện trên nền sáng
                                isActive
                                    ? "opacity-100"
                                    : "opacity-0 group-hover:opacity-100 group-hover:text-[#1A3A52]"
                            )}>
                                {course.label}
                            </span>

                            {/* ACTIVE INDICATOR (Gạch vàng) */}
                            {isActive && (
                                <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#D4A574]" />
                            )}
                        </button>
                    );
                })}
            </div>
        </aside>
    );
}