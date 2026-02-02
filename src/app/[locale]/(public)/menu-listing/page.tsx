"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
    FilterBar,
    CartSummary,
    FlyItems, FlyingItem,
    MenuSidebar
} from "@/features/menu-listing";
import { MenuGrid, COURSES } from "@/features/menu-listing/components/menu-grid";
import { OrderEvent } from "@/features/menu-listing/components/menu-card";

// Data cho Filter Bar (Ngang) - Giữ nguyên dạng string cho FilterBar cũ
const ELEMENTS = ["All", "Metal", "Wood", "Water", "Fire", "Earth"];

export default function MenuPage() {
    // --- STATE ---
    // COURSES bây giờ là mảng object, nên phải lấy .id
    const [activeCourse, setActiveCourse] = useState(COURSES[0].id);
    const [activeElement, setActiveElement] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    const router = useRouter();
    const locale = useLocale();

    const [isScrolled, setIsScrolled] = useState(false);
    const [cartTotal, setCartTotal] = useState(0);
    const [cartCount, setCartCount] = useState(0);
    const [isCartVisible, setIsCartVisible] = useState(false);
    const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);

    const isClickingRef = useRef(false);

    // Scroll Header Detect
    useEffect(() => {
        const onScroll = () => { setIsScrolled(window.scrollY > 40); };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Scroll Spy Logic
    useEffect(() => {
        const handleScrollSpy = () => {
            if (isClickingRef.current) return;
            const scrollPosition = window.scrollY + 300;

            for (const course of COURSES) {
                // 👇 Sửa: Dùng course.id vì course là object
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
        const { item, startPos } = event;
        if (!isCartVisible) setIsCartVisible(true);
        const cartElement = document.getElementById("cart-destination");
        let targetX = window.innerWidth - 50;
        let targetY = window.innerHeight - 50;
        if (cartElement) {
            const rect = cartElement.getBoundingClientRect();
            targetX = rect.left + rect.width / 2;
            targetY = rect.top + rect.height / 2;
        }
        const newItem = { id: Date.now(), img: startPos.img, startX: startPos.x, startY: startPos.y, targetX, targetY };
        setFlyingItems((prev) => [...prev, newItem]);
        setTimeout(() => { setCartCount((prev) => prev + 1); setCartTotal((prev) => prev + item.price); }, 700);
    };

    const removeFlyingItem = (id: number) => { setFlyingItems((prev) => prev.filter((i) => i.id !== id)); };
    const handleConfirmOrder = () => { router.push(`/${locale}/confirm-order`); };

    return (
        <div className="min-h-screen bg-[#FAF9F6] relative pb-20 pt-[80px]">

            {/* 1. FILTER BAR (NGANG - TRÊN) */}
            <FilterBar
                categories={ELEMENTS}
                activeCategory={activeElement}
                onSelect={setActiveElement}
                isScrolled={isScrolled}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            {/* 2. MENU GRID + SIDEBAR */}
            <MenuGrid
                onOrder={handleOrder}
                activeElement={activeElement}
                searchQuery={searchQuery}
                // 👇 SỬA LẠI SLOT SIDEBAR CHO ĐÚNG PROPS MỚI
                sidebarSlot={
                    <MenuSidebar
                        courses={COURSES} // Truyền mảng object từ menu-grid
                        activeCourse={activeCourse} // Props tên là activeCourse
                        onSelectCourse={handleCourseSelect} // Props tên là onSelectCourse
                    />
                }
            />

            {/* 3. CART & EFFECTS */}
            <div id="cart-destination" className={cn("fixed bottom-[40px] right-[20px] md:bottom-[100px] md:right-[40px] z-50 transition-all", isCartVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}>
                <div className="hover:translate-y-[-10px] transition-transform duration-300">
                    <CartSummary totalPrice={cartTotal} totalItems={cartCount} onConfirm={handleConfirmOrder} />
                </div>
            </div>
            <FlyItems items={flyingItems} onComplete={removeFlyingItem} />

        </div>
    );
}