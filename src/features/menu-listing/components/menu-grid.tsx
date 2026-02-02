"use client";

import { MenuCard, MenuItem, OrderEvent } from "./menu-card";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { ReactNode } from "react"; // Để nhận Sidebar slot

// --- DATA CẬP NHẬT (Thêm Course & Element) ---
// Course: Appetizers, Main Course... (Dùng cho Sidebar)
// Element: Fire, Water... (Dùng cho Filter trên)
const EXTENDED_MENU_ITEMS: (MenuItem & { course: string, element: string })[] = [
    {
        id: "1",
        translationKey: "1",
        price: 45,
        category: "Premium", // Giữ category cũ để làm tag trên thẻ
        course: "main",      // Mới: Dùng cho Sidebar
        element: "Fire",     // Mới: Dùng cho Top Filter
        image: "/images/menu-listing/menu-grid/Grilled Premium Wagyu Beef.png",
    },
    {
        id: "2",
        translationKey: "2",
        price: 52,
        category: "Seafood",
        course: "main",
        element: "Water",
        image: "/images/menu-listing/menu-grid/Lobster Thermidor.png",
    },
    {
        id: "3",
        translationKey: "3",
        price: 28,
        category: "Signature",
        course: "main",
        element: "Fire",
        image: "/images/menu-listing/menu-grid/Peking Duck.png",
    },
    {
        id: "4",
        translationKey: "4",
        price: 22,
        category: "Italian",
        course: "starters",
        element: "Earth",
        image: "/images/menu-listing/menu-grid/Truffle Mushroom Risotto.png",
    },
    {
        id: "5",
        translationKey: "5",
        price: 25,
        category: "Seafood",
        course: "starters",
        element: "Water",
        image: "/images/menu-listing/menu-grid/Smoked Salmon.png",
    },
    {
        id: "6",
        translationKey: "6",
        price: 8,
        category: "Desserts",
        course: "dessert",
        element: "Metal",
        image: "/images/menu-listing/menu-grid/Tiramisu.png",
    },
    {
        id: "7",
        translationKey: "7",
        price: 27,
        category: "Premium",
        course: "main",
        element: "Fire",
        image: "/images/menu-listing/menu-grid/Korean Grilled Beef.png",
    },
    {
        id: "8",
        translationKey: "8",
        price: 125,
        category: "Beverages",
        course: "beverage",
        element: "Earth",
        image: "/images/menu-listing/menu-grid/Krug Clos d'Ambonnay Champagne.png",
    },
];

// Định nghĩa các Course để render section
export const COURSES = [
    { id: "starters", label: "Appetizers" },
    { id: "main", label: "Main Course" },
    { id: "dessert", label: "Desserts" },
    { id: "beverage", label: "Beverages" },
];

export function MenuGrid({
                             onOrder,
                             activeElement = "All", // Filter ngang (Kim, Mộc...)
                             searchQuery = "",
                             sidebarSlot // Slot để chứa Sidebar
                         }: {
    onOrder?: (event: OrderEvent) => void,
    activeElement?: string,
    searchQuery?: string,
    sidebarSlot?: ReactNode
}) {
    const t = useTranslations("MenuListing.MenuGrid");

    return (
        <section className="w-full bg-[#FAF9F6] pb-16 md:pb-24 pt-4 relative">
            <div className="mx-auto max-w-[1280px] px-4 md:px-8 relative">

                {/* Header Section (Căn giữa) */}
                <div className="mb-12 text-center flex flex-col items-center">
                    <h2 className="mb-4 font-display text-[48px] font-bold leading-none text-[#0A0A0A]">
                        {t("title")}
                    </h2>
                    <p className="mx-auto max-w-[600px] font-body text-[18px] text-[#7A7A7A] leading-[29px]">
                        {t("subtitle")}
                    </p>
                </div>

                {/* --- LAYOUT CHÍNH: SIDEBAR + GRID --- */}
                <div className="relative">

                    {/* === 1. SIDEBAR SLOT (TRÁI) === */}
                    {/* - absolute: Để không ảnh hưởng width của Grid.
                        - left-[...]: Đẩy ra margin trái.
                        - top-[...]: Căn chỉnh để ngang hàng với thẻ Card đầu tiên.
                        - h-full: Để sticky hoạt động bên trong.
                    */}
                    <div className="hidden xl:block absolute top-0 bottom-0 left-[calc(50%-50vw)] w-[calc(50vw-50%)] pointer-events-none">
                        {/* pointer-events-auto để sidebar nhận click. top-[80px] để nó bắt đầu ngay dưới header section, ngang hàng với card */}
                        <div className="pointer-events-auto sticky top-[220px] h-fit pl-6 flex justify-start">
                            {sidebarSlot}
                        </div>
                    </div>

                    {/* === 2. MAIN GRID (SECTIONS) === */}
                    <div className="flex flex-col gap-16">
                        {COURSES.map(course => {
                            // Logic Lọc:
                            // 1. Lọc theo Course (Dọc)
                            let items = EXTENDED_MENU_ITEMS.filter(item => item.course === course.id);

                            // 2. Lọc theo Element (Ngang)
                            if (activeElement !== "All") {
                                items = items.filter(item => item.element === activeElement);
                            }

                            // 3. Lọc theo Search
                            if (searchQuery) {
                                items = items.filter(item =>
                                    t(`items.${item.translationKey}_name` as never).toLowerCase().includes(searchQuery.toLowerCase())
                                );
                            }

                            if (items.length === 0) return null;

                            return (
                                <section key={course.id} id={course.id} className="scroll-mt-[200px]">
                                    {/* Course Title */}
                                    <div className="flex items-center gap-4 mb-6">
                                        <h3 className="font-display text-3xl font-bold text-[#1A3A52]">
                                            {course.label}
                                        </h3>
                                        <div className="h-[1px] flex-1 bg-[#1A3A52]/10"></div>
                                    </div>

                                    {/* Grid */}
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                        {items.map((item) => (
                                            <MenuCard
                                                key={item.id}
                                                item={item}
                                                onOrder={onOrder}
                                            />
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </div>

                </div>
            </div>
        </section>
    );
}