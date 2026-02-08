// app/menu-listing/page.tsx
'use client';

import { useState } from "react";
import { AnimatePresence } from "framer-motion";

// IMPORT COMPONENTS
import { CartSummary, CartItem, TableSelectionModal } from "@/features/customer/menu-listing";
import { Atmosphere } from "@/features/customer/menu-listing-new/components/atmosphere";
import { BookFrame } from "@/features/customer/menu-listing-new/components/book-frame";
import { LeftPage } from "@/features/customer/menu-listing-new/components/left-page";
import { RightPage } from "@/features/customer/menu-listing-new/components/right-page";
import { MenuItem } from "@/features/customer/menu-listing-new/components/menu-card";

export default function MenuListingPage() {
    // ================= STATE =================
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [tableNumber, setTableNumber] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingQueue, setPendingQueue] = useState<MenuItem[]>([]);

    // ================= LOGIC =================

    // Thêm vào giỏ hàng chính thức
    const addToCart = (itemsToAdd: MenuItem[]) => {
        setCartItems((prev) => {
            const newCart = [...prev];
            itemsToAdd.forEach(newItem => {
                const existingIndex = newCart.findIndex(i => i.id === newItem.id);
                // Parse giá
                const priceNumber = typeof newItem.price === 'string'
                    ? parseFloat((newItem.price as string).replace(/[^0-9.]/g, ''))
                    : newItem.price;

                if (existingIndex > -1) {
                    newCart[existingIndex] = {
                        ...newCart[existingIndex],
                        quantity: newCart[existingIndex].quantity + 1
                    };
                } else {
                    newCart.push({
                        id: newItem.id,
                        name: newItem.name,
                        price: priceNumber,
                        quantity: 1,
                    });
                }
            });
            return newCart;
        });
    };

    // XỬ LÝ KHI BẤM NÚT ORDER
    const handleOrder = (item: MenuItem, _startPos: { x: number; y: number }) => {
        if (!tableNumber) {
            // Chưa có bàn: Lưu vào hàng đợi -> Mở Modal (CHƯA THÊM VÀO GIỎ CHÍNH)
            setPendingQueue(prev => [...prev, item]);
            setIsModalOpen(true);
        } else {
            // Đã có bàn: Thêm thẳng vào giỏ
            addToCart([item]);
        }
    };

    // XÁC NHẬN SỐ BÀN
    const handleTableConfirm = (val: string) => {
        setTableNumber(val);
        setIsModalOpen(false);

        // Lúc này mới đổ hàng đợi vào giỏ chính thức -> Cái lá mới hiện
        if (pendingQueue.length > 0) {
            addToCart(pendingQueue);
            setPendingQueue([]);
        }
    };

    // Helper functions
    const handleUpdateQuantity = (id: string, delta: number) => {
        setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
    };
    const handleRemoveItem = (id: string) => setCartItems(prev => prev.filter(item => item.id !== id));

    return (
        <main className="relative flex-1 min-h-screen w-full flex items-center justify-center p-4 py-20 pt-[140px] overflow-hidden bg-[#0f172a]">

            <TableSelectionModal
                isOpen={isModalOpen}
                onConfirm={handleTableConfirm}
                onClose={() => setIsModalOpen(false)}
            />

            <Atmosphere />

            <div className="relative z-10 w-full max-w-[1400px]">
                <BookFrame>
                    <LeftPage onOrder={handleOrder} />
                    <div className="w-[1px] h-full bg-white/10 z-20 shadow-[0_0_15px_rgba(0,0,0,0.2)]"></div>
                    <RightPage onOrder={handleOrder} />
                </BookFrame>
            </div>

            {/* GIỎ HÀNG CÁI LÁ */}
            <div
                id="cart-destination"
                className="fixed bottom-[83px] right-[20px] z-50 pointer-events-none flex flex-col items-end justify-end"
            >
                <AnimatePresence>
                    {/* QUAN TRỌNG: Chỉ hiện khi cartItems > 0.
                        pendingQueue > 0 cũng KHÔNG hiện (để ẩn khi đang nhập bàn) */}
                    {cartItems.length > 0 && (
                        <div className="pointer-events-auto transform scale-90 md:scale-100 origin-bottom-right">
                            <CartSummary
                                cartItems={cartItems}
                                tableNumber={tableNumber}
                                onUpdateTable={setTableNumber}
                                onUpdateQuantity={handleUpdateQuantity}
                                onRemoveItem={handleRemoveItem}
                                onConfirm={() => console.log("Checkout", cartItems)}
                            />
                        </div>
                    )}
                </AnimatePresence>
            </div>

        </main>
    );
}