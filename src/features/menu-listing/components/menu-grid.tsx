"use client";

import { MenuCard, MenuItem, OrderEvent } from "./menu-card";
import { useTranslations } from "next-intl";
import { ReactNode } from "react";
// 👇 IMPORT QUAN TRỌNG
import { motion,Variants } from "framer-motion";

// --- DATA (Giữ nguyên) ---
const EXTENDED_MENU_ITEMS: (MenuItem & { course: string, element: string })[] = [
    { id: "1", translationKey: "1", price: 45, category: "Premium", course: "main", element: "Fire", image: "/images/menu-listing/menu-grid/Grilled Premium Wagyu Beef.png" },
    { id: "2", translationKey: "2", price: 52, category: "Seafood", course: "main", element: "Water", image: "/images/menu-listing/menu-grid/Lobster Thermidor.png" },
    { id: "3", translationKey: "3", price: 28, category: "Signature", course: "main", element: "Fire", image: "/images/menu-listing/menu-grid/Peking Duck.png" },
    { id: "4", translationKey: "4", price: 22, category: "Italian", course: "starters", element: "Earth", image: "/images/menu-listing/menu-grid/Truffle Mushroom Risotto.png" },
    { id: "5", translationKey: "5", price: 25, category: "Seafood", course: "starters", element: "Water", image: "/images/menu-listing/menu-grid/Smoked Salmon.png" },
    { id: "6", translationKey: "6", price: 8, category: "Desserts", course: "dessert", element: "Metal", image: "/images/menu-listing/menu-grid/Tiramisu.png" },
    { id: "7", translationKey: "7", price: 27, category: "Premium", course: "main", element: "Fire", image: "/images/menu-listing/menu-grid/Korean Grilled Beef.png" },
    { id: "8", translationKey: "8", price: 125, category: "Beverages", course: "beverage", element: "Earth", image: "/images/menu-listing/menu-grid/Krug Clos d'Ambonnay Champagne.png" },
];

export const COURSES = [
    { id: "starters", label: "Appetizers" },
    { id: "main", label: "Main Course" },
    { id: "dessert", label: "Desserts" },
    { id: "beverage", label: "Beverages" },
];

// --- ĐỊNH NGHĨA VARIANTS CHO HIỆU ỨNG ---

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3,
        }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 80, damping: 15 }
    }
};
export function MenuGrid({
                             onOrder,
                             activeElement = "All",
                             searchQuery = "",
                             sidebarSlot
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

                <div className="relative">

                    {/* === SIDEBAR SLOT (TRÁI) - ĐÃ ĐƯỢC BỌC MOTION Ở FILE PAGE.TSX === */}
                    <div className="hidden xl:block absolute top-0 bottom-0 left-[calc(50%-50vw)] w-[calc(50vw-50%)] pointer-events-none">
                        <div className="pointer-events-auto sticky top-[220px] h-fit pl-6 flex justify-start">
                            {sidebarSlot}
                        </div>
                    </div>

                    {/* === MAIN GRID (SECTIONS) === */}
                    <motion.div
                        className="flex flex-col gap-16"
                        variants={containerVariants} // Áp dụng logic Stagger
                        initial="hidden"             // Trạng thái ban đầu
                        animate="show"               // Trạng thái kết thúc
                    >
                        {COURSES.map(course => {
                            let items = EXTENDED_MENU_ITEMS.filter(item => item.course === course.id);

                            if (activeElement !== "All") {
                                items = items.filter(item => item.element === activeElement);
                            }

                            if (searchQuery) {
                                items = items.filter(item =>
                                    t(`items.${item.translationKey}_name` as never).toLowerCase().includes(searchQuery.toLowerCase())
                                );
                            }

                            if (items.length === 0) return null;

                            return (
                                <section key={course.id} id={course.id} className="scroll-mt-[200px]">
                                    {/* Tiêu đề nhóm cũng có hiệu ứng hiện ra */}
                                    <motion.div variants={itemVariants} className="flex items-center gap-4 mb-6">
                                        <h3 className="font-display text-3xl font-bold text-[#1A3A52]">
                                            {course.label}
                                        </h3>
                                        <div className="h-[1px] flex-1 bg-[#1A3A52]/10"></div>
                                    </motion.div>

                                    {/* Grid Món ăn */}
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                        {items.map((item) => (
                                            // 👇 BỌC CARD TRONG MOTION.DIV
                                            <motion.div key={item.id} variants={itemVariants}>
                                                <MenuCard
                                                    item={item}
                                                    onOrder={onOrder}
                                                />
                                            </motion.div>
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </motion.div>

                </div>
            </div>
        </section>
    );
}