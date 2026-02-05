"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";

import {
    FilterBar,
    CartSummary,
    MenuSidebar,
    CartItem,
    TableSelectionModal
} from "@/features/customer/menu-listing";
import { MenuGrid, COURSES } from "@/features/customer/menu-listing/components/menu-grid";
import { OrderEvent, MenuItem } from "@/features/customer/menu-listing/components/menu-card";

// Data cho Filter Bar
const ELEMENTS = ["All", "Metal", "Wood", "Water", "Fire", "Earth"];

export default function MenuPage() {
    const [activeCourse, setActiveCourse] = useState(COURSES[0].id);
    const [activeElement, setActiveElement] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    const router = useRouter();
    const locale = useLocale();

    const [isScrolled, setIsScrolled] = useState(false);

    // --- STATE QUẢN LÝ ITEM VÀ SỐ BÀN ---
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    // 1. Trạng thái bàn & Modal
    const [tableNumber, setTableNumber] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 2. [QUAN TRỌNG] Pending Queue: Hàng đợi lưu nhiều món khi chưa có bàn
    const [pendingQueue, setPendingQueue] = useState<MenuItem[]>([]);

    const isCartVisible = cartItems.length > 0;
    const isClickingRef = useRef(false);

    useEffect(() => {
        const onScroll = () => { setIsScrolled(window.scrollY > 40); };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // ScrollSpy Logic (Giữ nguyên)
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

    // --- HELPER: XỬ LÝ THÊM VÀO GIỎ CHÍNH THỨC ---
    const processAddToCart = (itemsToAdd: MenuItem[]) => {
        setCartItems((prev) => {
            let newCart = [...prev];
            itemsToAdd.forEach(newItem => {
                const existingIndex = newCart.findIndex(i => i.id === newItem.id);
                if (existingIndex > -1) {
                    // Món đã có -> Tăng số lượng
                    newCart[existingIndex] = {
                        ...newCart[existingIndex],
                        quantity: newCart[existingIndex].quantity + 1
                    };
                } else {
                    // Món mới -> Thêm vào
                    newCart.push({
                        id: newItem.id,
                        name: (newItem as any).name || `Item ${newItem.id}`,
                        price: newItem.price,
                        quantity: 1,
                    });
                }
            });
            return newCart;
        });
    };

    // --- LOGIC ORDER CHÍNH ---
    const handleOrder = (event: OrderEvent) => {
        const { item } = event;

        // Nếu chưa có số bàn -> Lưu vào hàng đợi & Mở modal
        if (!tableNumber) {
            setPendingQueue(prev => [...prev, item]); // Cộng dồn món vào hàng đợi
            setIsModalOpen(true);
            return;
        }

        // Đã có bàn -> Thêm thẳng vào giỏ
        processAddToCart([item]);
    };

    const handleUpdateQuantity = (id: string, delta: number) => {
        setCartItems((prev) => prev.map((item) => {
            if (item.id === id) {
                const newQuantity = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    const handleRemoveItem = (id: string) => {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
    };

    const handleConfirmOrder = () => {
        console.log("Processing Order:", { tableNumber, items: cartItems });
        router.push(`/${locale}/confirm-order`);
    };

    // --- XỬ LÝ KHI NHẬP XONG SỐ BÀN ---
    const handleTableConfirm = (val: string) => {
        setTableNumber(val);
        setIsModalOpen(false);

        // Đổ toàn bộ hàng đợi vào giỏ hàng chính thức
        if (pendingQueue.length > 0) {
            processAddToCart(pendingQueue);
            setPendingQueue([]); // Xóa hàng đợi
        }
    };

    // --- XỬ LÝ KHI ĐÓNG MODAL MÀ KHÔNG NHẬP ---
    const handleModalClose = () => {
        setIsModalOpen(false);
        // Lưu ý: KHÔNG xóa pendingQueue ở đây.
        // Để lần sau khách mở lại hoặc order tiếp, list chờ vẫn còn đó.
    };

    return (
        <div className="min-h-screen bg-[#FAF9F6] relative pb-20 pt-[40px]">

            <TableSelectionModal
                isOpen={isModalOpen}
                onConfirm={handleTableConfirm}
                onClose={handleModalClose} // Cho phép đóng modal thoải mái
            />

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
                sidebarSlot={
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
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

            {/* --- CONTAINER GIỎ HÀNG --- */}
            <div
                id="cart-destination"
                className="fixed bottom-[40px] right-[20px] md:bottom-[40px] md:right-[40px] z-50 pointer-events-none flex flex-col items-end justify-end max-w-[calc(100vw-40px)]"
            >
                <AnimatePresence>
                    {isCartVisible && (
                        <div className="pointer-events-auto">
                            <CartSummary
                                cartItems={cartItems}
                                tableNumber={tableNumber}
                                onUpdateTable={setTableNumber}
                                onUpdateQuantity={handleUpdateQuantity}
                                onRemoveItem={handleRemoveItem}
                                onConfirm={handleConfirmOrder}
                            />
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}