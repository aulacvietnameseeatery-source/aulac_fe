'use client';

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react"; // Icon loading khi chờ API

// IMPORT COMPONENTS
import { CartSummary, CartItem, TableSelectionModal } from "@/features/customer/menu-listing";
import { Atmosphere } from "@/features/customer/menu-listing-new/components/atmosphere";
import { BookFrame } from "@/features/customer/menu-listing-new/components/book-frame";
import { MenuItemData } from "@/features/customer/menu-listing-new/data/mock-menu"; // Chỉ import type

// IMPORT HOOK LẤY DATA THẬT
import { useMenuData } from "@/features/customer/menu-listing-new/hooks/use-menu-data";

export default function MenuListingPage() {
    // ================= STATE =================
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [tableNumber, setTableNumber] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingQueue, setPendingQueue] = useState<MenuItemData[]>([]);

    // Hook lấy dữ liệu menu thật từ Backend
    const { menuData, isLoading } = useMenuData();

    // ================= LOGIC =================

    // Thêm vào giỏ hàng chính thức
    const addToCart = (itemsToAdd: MenuItemData[]) => {
        setCartItems((prev) => {
            const newCart = [...prev];
            itemsToAdd.forEach(newItem => {
                const existingIndex = newCart.findIndex(i => i.id === newItem.id);
                // Parse giá để tránh lỗi
                const priceNumber = typeof newItem.price === 'string'
                    ? parseFloat((newItem.price as string).replace(/[^0-9.]/g, ''))
                    : typeof newItem.price === 'number' ? newItem.price : 0;

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
                        image: newItem.image
                    });
                }
            });
            return newCart;
        });
    };

    // Callback từ BookFrame (Click nút Add trong Detail Popup hoặc MenuCard)
    const handleAddToCartFromBook = (item: MenuItemData) => {
        if (!tableNumber) {
            setPendingQueue(prev => [...prev, item]);
            setIsModalOpen(true);
        } else {
            addToCart([item]);
        }
    };

    // XÁC NHẬN SỐ BÀN
    const handleTableConfirm = (val: string) => {
        setTableNumber(val);
        setIsModalOpen(false);

        if (pendingQueue.length > 0) {
            addToCart(pendingQueue);
            setPendingQueue([]);
        }
    };

    // Helper functions cho giỏ hàng
    const handleUpdateQuantity = (id: string, delta: number) => {
        setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
    };

    const handleRemoveItem = (id: string) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    return (
        <main className="relative flex-1 min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-[#0f172a]">

            <TableSelectionModal
                isOpen={isModalOpen}
                onConfirm={handleTableConfirm}
                onClose={() => setIsModalOpen(false)}
            />

            <Atmosphere />

            <div className="relative z-10 w-full max-w-[1400px]">
                {/* HIỂN THỊ LOADING KHI ĐANG FETCH API HOẶC HIỂN THỊ BOOK FRAME KHI ĐÃ CÓ DATA */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-[60vh]">
                        <Loader2 className="w-12 h-12 text-[#C5A059] animate-spin mb-4" />
                        <p className="text-[#C5A059] font-display tracking-widest uppercase">Opening Menu...</p>
                    </div>
                ) : (
                    <BookFrame
                        menuData={menuData} // Truyền dữ liệu thật đã gom nhóm
                        onAddToCart={handleAddToCartFromBook}
                    />
                )}
            </div>

            {/* GIỎ HÀNG */}
            <div
                id="cart-destination"
                className="fixed bottom-20.75 right-5 z-50 pointer-events-none flex flex-col items-end justify-end"
            >
                <AnimatePresence>
                    {cartItems.length > 0 && (
                        <div className="pointer-events-auto transform scale-90 md:scale-100 origin-bottom-right">
                            <CartSummary
                                cartItems={cartItems}
                                tableNumber={tableNumber}
                                onUpdateTable={setTableNumber}
                                onUpdateQuantity={handleUpdateQuantity}
                                onRemoveItem={handleRemoveItem}
                                onConfirm={() => console.log("Checkout requested:", cartItems)}
                            />
                        </div>
                    )}
                </AnimatePresence>
            </div>

        </main>
    );
}