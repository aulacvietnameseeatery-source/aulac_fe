"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
// 👇 IMPORT QUAN TRỌNG
import { AnimatePresence, motion } from "framer-motion";

import {
    FilterBar,
    CartSummary,
    MenuSidebar
} from "@/features/menu-listing";
import { MenuGrid, COURSES } from "@/features/menu-listing/components/menu-grid";
import { OrderEvent } from "@/features/menu-listing/components/menu-card";

// Data cho Filter Bar
const ELEMENTS = ["All", "Metal", "Wood", "Water", "Fire", "Earth"];

export default function MenuPage() {
    const [activeCourse, setActiveCourse] = useState(COURSES[0].id);
    const [activeElement, setActiveElement] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    const router = useRouter();
    const locale = useLocale();

    const [isScrolled, setIsScrolled] = useState(false);
    const [cartTotal, setCartTotal] = useState(0);
    const [cartCount, setCartCount] = useState(0);
    const [isCartVisible, setIsCartVisible] = useState(false);

    const isClickingRef = useRef(false);

    useEffect(() => {
        const onScroll = () => { setIsScrolled(window.scrollY > 40); };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        const handleScrollSpy = () => {
            if (isClickingRef.current) return;
            const scrollPosition = window.scrollY + 300;
            for (const course of COURSES) {
                const element = document.getElementById(course.id);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveCourse(course.id);
                        break;
                    }
                }
            }
        };
        window.addEventListener("scroll", handleScrollSpy);
        return () => window.removeEventListener("scroll", handleScrollSpy);
    }, []);

    const handleCourseSelect = (id: string) => {
        isClickingRef.current = true;
        setActiveCourse(id);
        const element = document.getElementById(id);
        if (element) {
            const offset = 200;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const offsetPosition = elementRect - bodyRect - offset;
            window.scrollTo({ top: offsetPosition, behavior: "smooth" });
            setTimeout(() => { isClickingRef.current = false; }, 1000);
        }
    };

    const handleOrder = (event: OrderEvent) => {
        const { item } = event;
        if (!isCartVisible) setIsCartVisible(true);
        setCartCount((prev) => prev + 1);
        setCartTotal((prev) => prev + item.price);
    };

    const handleConfirmOrder = () => { router.push(`/${locale}/confirm-order`); };

    return (
        <div className="min-h-screen bg-[#FAF9F6] relative pb-20 pt-[40px]">

            <FilterBar
                categories={ELEMENTS}
                activeCategory={activeElement}
                onSelect={setActiveElement}
                isScrolled={isScrolled}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            <MenuGrid
                onOrder={handleOrder}
                activeElement={activeElement}
                searchQuery={searchQuery}
                // 👇 SỬA ĐOẠN NÀY: Bọc Sidebar trong motion.div
                sidebarSlot={
                    <motion.div
                        // Ban đầu: Mờ và dịch sang trái 50px
                        initial={{ opacity: 0, x: -50 }}
                        // Kết thúc: Hiện rõ và về vị trí 0
                        animate={{ opacity: 1, x: 0 }}
                        // Cấu hình: Chờ 0.2s rồi chạy trong 0.6s
                        transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                    >
                        <MenuSidebar
                            courses={COURSES}
                            activeCourse={activeCourse}
                            onSelectCourse={handleCourseSelect}
                        />
                    </motion.div>
                }
            />

            <div
                id="cart-destination"
                className="fixed bottom-[40px] right-[20px] md:bottom-[100px] md:right-[40px] z-50 pointer-events-none"
            >
                <AnimatePresence>
                    {isCartVisible && (
                        <div className="pointer-events-auto hover:translate-y-[-10px] transition-transform duration-300">
                            <CartSummary
                                totalPrice={cartTotal}
                                totalItems={cartCount}
                                onConfirm={handleConfirmOrder}
                            />
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}