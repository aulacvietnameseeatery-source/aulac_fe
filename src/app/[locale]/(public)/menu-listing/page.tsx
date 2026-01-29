"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation"; // 1. Import Router
import { useLocale } from "next-intl";       // 2. Import Locale để giữ đúng ngôn ngữ
import {
    FilterBar,
    MenuGrid,
    CartSummary,
    FlyItems, FlyingItem
} from "@/features/menu-listing";
import { OrderEvent } from "@/features/menu-listing/components/menu-card";

const CATEGORIES = ["All", "Appetizers", "Main Course", "Seafood", "Desserts", "Beverages", "Italian"];

export default function MenuPage() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    // --- SETUP ĐIỀU HƯỚNG ---
    const router = useRouter();
    const locale = useLocale(); // Lấy ngôn ngữ hiện tại (en hoặc fr)

    // --- 1. STATE SCROLL (Logic cũ) ---
    const [isScrolled, setIsScrolled] = useState(false);
    useEffect(() => {
        let compact = false;
        const onScroll = () => {
            const y = window.scrollY;
            if (!compact && y > 40) {
                compact = true;
                setIsScrolled(true);
            } else if (compact && y < 10) {
                compact = false;
                setIsScrolled(false);
            }
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // --- 2. STATE GIỎ HÀNG (Logic mới) ---
    const [cartTotal, setCartTotal] = useState(0);
    const [cartCount, setCartCount] = useState(0);
    const [isCartVisible, setIsCartVisible] = useState(false);

    // State danh sách các món đang bay
    const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);

    // --- 3. HÀM XỬ LÝ ORDER ---
    const handleOrder = (event: OrderEvent) => {
        const { item, startPos } = event;

        // Hiện giỏ hàng nếu đang ẩn
        if (!isCartVisible) {
            setIsCartVisible(true);
        }

        // Tính toán đích đến (Vị trí cái lá CartSummary)
        const cartElement = document.getElementById("cart-destination");
        let targetX = window.innerWidth - 50; // Fallback
        let targetY = window.innerHeight - 50; // Fallback

        if (cartElement) {
            const rect = cartElement.getBoundingClientRect();
            targetX = rect.left + rect.width / 2;
            targetY = rect.top + rect.height / 2;
        }

        // Tạo item bay
        const newItem = {
            id: Date.now(),
            img: startPos.img,
            startX: startPos.x,
            startY: startPos.y,
            targetX,
            targetY,
        };
        setFlyingItems((prev) => [...prev, newItem]);

        // Cập nhật tiền sau khi bay xong (0.7s)
        setTimeout(() => {
            setCartCount((prev) => prev + 1);
            setCartTotal((prev) => prev + item.price);
        }, 700);
    };

    // Xóa item bay khi xong
    const removeFlyingItem = (id: number) => {
        setFlyingItems((prev) => prev.filter((i) => i.id !== id));
    };

    // --- 4. HÀM CHUYỂN TRANG CONFIRM ORDER ---
    const handleConfirmOrder = () => {
        // Điều hướng tới /{locale}/confirm-order (VD: /en/confirm-order)
        router.push(`/${locale}/confirm-order`);
    };

    return (
        <div className="min-h-screen bg-[#FAF9F6] relative pb-20">

            <FilterBar
                categories={CATEGORIES}
                activeCategory={activeCategory}
                onSelect={setActiveCategory}
                isScrolled={isScrolled}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            <MenuGrid
                onOrder={handleOrder}
                activeCategory={activeCategory}
                searchQuery={searchQuery}
            />

            {/* --- GIỎ HÀNG ĐỘNG --- */}
            <div
                id="cart-destination"
                className={cn(
                    "fixed bottom-[40px] right-[20px] md:bottom-[250px] md:right-[40px] z-50 transition-all duration-500 ease-out transform",
                    isCartVisible
                        ? "translate-y-0 opacity-100 pointer-events-auto"
                        : "translate-y-[120%] opacity-0 pointer-events-none"
                )}
            >
                {/* Wrapper để xử lý hover riêng */}
                <div className="hover:translate-y-[-10px] transition-transform duration-300">
                    <CartSummary
                        totalPrice={cartTotal}
                        totalItems={cartCount}
                        onConfirm={handleConfirmOrder}
                    />
                </div>
            </div>

            {/* Component hiệu ứng bay */}
            <FlyItems items={flyingItems} onComplete={removeFlyingItem} />

        </div>
    );
}