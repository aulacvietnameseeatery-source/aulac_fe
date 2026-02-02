"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
    FilterBar,
    MenuGrid,
    CartSummary,
    FlyItems, FlyingItem,
    MenuSidebar
} from "@/features/menu-listing";
import { OrderEvent } from "@/features/menu-listing/components/menu-card";

const CATEGORIES = ["All", "Appetizers", "Main Course", "Seafood", "Desserts", "Beverages", "Italian"];

export default function MenuPage() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();
    const locale = useLocale();

    // States (Giữ nguyên logic cũ)
    const [isScrolled, setIsScrolled] = useState(false);
    const [cartTotal, setCartTotal] = useState(0);
    const [cartCount, setCartCount] = useState(0);
    const [isCartVisible, setIsCartVisible] = useState(false);
    const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);

    useEffect(() => {
        let compact = false;
        const onScroll = () => {
            const y = window.scrollY;
            if (!compact && y > 40) { compact = true; setIsScrolled(true); }
            else if (compact && y < 10) { compact = false; setIsScrolled(false); }
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

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
        <div className="min-h-screen bg-[#FAF9F6] relative pb-20">

            {/* 1. FILTER BAR (Ngang - Ở trên cùng) */}
            <FilterBar
                categories={CATEGORIES}
                activeCategory={activeCategory}
                onSelect={setActiveCategory}
                isScrolled={isScrolled}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            {/* === MAIN CONTAINER (Chứa Sidebar + Grid) ===
                - flex: Để chia cột.
                - justify-center: Căn giữa nội dung chính (MenuGrid).
                - gap-8: Khoảng cách giữa Sidebar và Grid.
                - px-4: Padding cho mobile.
                - max-w-[1600px]: Giới hạn chiều rộng tổng thể để Sidebar không bị đẩy quá xa trên màn 24 inch.
            */}
            <div className="flex justify-center gap-8 px-4 md:px-8 mx-auto max-w-[1600px] mt-8 relative">

                {/* === CỘT TRÁI: SIDEBAR FILTER === */}
                {/* - hidden xl:block: Chỉ hiện trên màn hình rộng (>1280px).
                    - sticky: Để dính lại khi cuộn.
                    - top-[180px]: Vị trí dính (tính toán để né Header và FilterBar ngang).
                    - h-fit: Chiều cao vừa đủ nội dung.
                    - w-[60px] hoặc w-[200px]: Do component Sidebar tự quản lý width.
                    - z-30: Nổi lên trên nền.
                */}
                <div className="hidden xl:block sticky top-[180px] h-fit z-30 self-start -ml-[80px] 2xl:-ml-[120px]">
                    {/* -ml-[...] để kéo sidebar sang trái vào vùng margin, giữ MenuGrid ở giữa */}
                    <MenuSidebar
                        categories={CATEGORIES}
                        activeCategory={activeCategory}
                        onSelectCategory={setActiveCategory}
                    />
                </div>

                {/* === CỘT GIỮA: MENU GRID (NỘI DUNG CHÍNH) === */}
                {/* max-w-[1280px] để giữ kích thước chuẩn như cũ */}
                <div className="flex-1 max-w-[1280px]">
                    <MenuGrid
                        onOrder={handleOrder}
                        activeCategory={activeCategory}
                        searchQuery={searchQuery}
                    />
                </div>

                {/* === CỘT PHẢI: KHOẢNG TRỐNG CÂN ĐỐI (Optional) === */}
                {/* Dùng div rỗng này để flexbox căn giữa MenuGrid nếu cần, nhưng ở đây ta dùng ml âm cho sidebar nên không cần */}
            </div>

            {/* CART (Giữ nguyên fixed position) */}
            <div
                id="cart-destination"
                className={cn(
                    "fixed bottom-[40px] right-[20px] md:bottom-[250px] md:right-[40px] z-50 transition-all duration-500 ease-out transform",
                    isCartVisible ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-[120%] opacity-0 pointer-events-none"
                )}
            >
                <div className="hover:translate-y-[-10px] transition-transform duration-300">
                    <CartSummary totalPrice={cartTotal} totalItems={cartCount} onConfirm={handleConfirmOrder} />
                </div>
            </div>

            <FlyItems items={flyingItems} onComplete={removeFlyingItem} />
        </div>
    );
}