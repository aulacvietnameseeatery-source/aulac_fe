'use client';

import { useState, useMemo, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Atmosphere } from "@/features/customer/menu-listing-new/components/atmosphere";
import { BookFrame } from "@/features/customer/menu-listing-new/components/book-frame";
import { CartItem } from "@/features/customer/menu-listing-new/types/cart";

import { MenuCategory, MenuItemData } from "@/features/customer/menu-listing-new/data/mock-menu";
import { RawMenuCategory } from "@/features/customer/menu-listing-new/hooks/use-menu-data";

import { TableSelectionModal } from "@/features/customer/menu-listing-new/components/table-selection-modal";
import { CartSummary } from "@/features/customer/menu-listing-new/components/cart-summary";

interface Props {
    // Nhận dữ liệu thô từ Server (chứa I18nText)
    initialMenuData: RawMenuCategory[];
    locale: 'vi' | 'en' | 'fr';
}

const CART_STORAGE_KEY = "aulac_cart_items";
const TABLE_STORAGE_KEY = "aulac_table_number";

export default function MenuListingClient({ initialMenuData, locale }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [tableNumber, setTableNumber] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingQueue, setPendingQueue] = useState<MenuItemData[]>([]);

    // Khôi phục cart và table number từ localStorage/URL khi component mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                // Khôi phục cart
                const savedCart = localStorage.getItem(CART_STORAGE_KEY);
                if (savedCart) {
                    setCartItems(JSON.parse(savedCart));
                }
                
                // Khôi phục table number từ URL params hoặc localStorage
                const tableFromUrl = searchParams.get("table");
                const savedTable = localStorage.getItem(TABLE_STORAGE_KEY);
                
                if (tableFromUrl) {
                    setTableNumber(tableFromUrl);
                    localStorage.setItem(TABLE_STORAGE_KEY, tableFromUrl);
                } else if (savedTable) {
                    setTableNumber(savedTable);
                }
            } catch (error) {
                console.error("Error loading from localStorage:", error);
            }
        }
    }, [searchParams]);

    // Lưu cart vào localStorage mỗi khi thay đổi
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
            } catch (error) {
                console.error("Error saving cart to localStorage:", error);
            }
        }
    }, [cartItems]);

    // Lưu table number vào localStorage mỗi khi thay đổi
    useEffect(() => {
        if (typeof window !== 'undefined' && tableNumber) {
            try {
                localStorage.setItem(TABLE_STORAGE_KEY, tableNumber);
            } catch (error) {
                console.error("Error saving table to localStorage:", error);
            }
        }
    }, [tableNumber]);

    // MAPPING DATA: Biến RawMenuCategory (Object) thành MenuCategory (String)
    const localizedMenu: MenuCategory[] = useMemo(() => {
        return initialMenuData.map(cat => ({
            id: cat.id,
            name: cat.name[locale] || cat.name.en, // Bóc ra chuỗi string
            items: cat.items.map(item => ({
                id: item.id,
                name: item.name[locale] || item.name.en, // Bóc ra chuỗi string
                price: item.price,
                desc: item.desc[locale] || item.desc.en, // Bóc ra chuỗi string
                image: item.image
            }))
        }));
    }, [initialMenuData, locale]);

    // Thêm vào giỏ hàng
    const addToCart = (itemsToAdd: any[]) => {
        setCartItems((prev) => {
            const newCart = [...prev];
            itemsToAdd.forEach(newItem => {
                const existingIndex = newCart.findIndex(i => i.id === newItem.id);
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
                        name: newItem.name, // Sẽ lấy đúng tên đã được dịch
                        price: priceNumber,
                        quantity: 1,
                        image: newItem.image
                    });
                }
            });
            return newCart;
        });
    };

    const handleAddToCartFromBook = (item: any) => {
        if (!tableNumber) {
            setPendingQueue(prev => [...prev, item]);
            setIsModalOpen(true);
        } else {
            addToCart([item]);
        }
    };

    const handleTableConfirm = (val: string) => {
        // Set table number and save to localStorage
        setTableNumber(val);
        if (typeof window !== 'undefined') {
            localStorage.setItem(TABLE_STORAGE_KEY, val);
        }
        
        // Add pending items to cart if any
        if (pendingQueue.length > 0) {
            addToCart(pendingQueue);
            setPendingQueue([]);
        }
        
        // Navigate to fill-infor-customer with table number
        router.push(`/fill-infor-customer?table=${encodeURIComponent(val)}`);
    };

    const handleUpdateQuantity = (id: string, delta: number) => {
        setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
    };

    const handleRemoveItem = (id: string) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    const handleUpdateNote = (id: string, note: string) => {
        setCartItems(prev => prev.map(item => item.id === id ? { ...item, note } : item));
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
                <BookFrame
                    menuData={localizedMenu}
                    onAddToCart={handleAddToCartFromBook}
                />
            </div>


            {/* ĐÃ SỬA: Canh phải cho cả Mobile (right-4) và Desktop (md:right-5) */}
            {/* Hiển thị cart khi có table number (dù chưa có món) */}
            <div id="cart-destination" className="fixed bottom-6 right-4 md:bottom-8 md:right-5 z-50 pointer-events-none flex flex-col items-end justify-end">
                <AnimatePresence>
                    {tableNumber && (
                        <div className="pointer-events-auto">
                        <CartSummary
                        cartItems={cartItems}
                    tableNumber={tableNumber}
                    onUpdateTable={setTableNumber}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleRemoveItem}
                    onUpdateNote={handleUpdateNote}
                    onConfirm={() => {
                        // Tạm thời không xử lý gì
                    }}
                />
            </div>
            )}
                </AnimatePresence>
            </div>
        </main>
    );
}