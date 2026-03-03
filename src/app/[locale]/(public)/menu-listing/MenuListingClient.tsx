'use client';

import { useState, useMemo, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { api } from "@/lib/http";
import { ApiResponse } from "@/types/api-response.types";
import { Atmosphere } from "@/features/customer/menu-listing-new/components/atmosphere";
import { BookFrame } from "@/features/customer/menu-listing-new/components/book-frame";
import { CartItem } from "@/features/customer/menu-listing-new/types/cart";

import { MenuCategory, MenuItemData } from "@/features/customer/menu-listing-new/data/mock-menu";
import { RawMenuCategory } from "@/features/customer/menu-listing-new/hooks/use-menu-data";

import { TableSelectionModal } from "@/features/customer/menu-listing-new/components/table-selection-modal";
import { CartSummary } from "@/features/customer/menu-listing-new/components/cart-summary";
import { OrderHistoryFAB } from "@/features/customer/menu-listing-new/components/ordered-items-fab";


interface Props {
    // Nhận dữ liệu thô từ Server (chứa I18nText)
    initialMenuData: RawMenuCategory[];
    locale: 'vi' | 'en' | 'fr';
}

const CART_STORAGE_KEY = "aulac_cart_items";
const TABLE_STORAGE_KEY = "aulac_table_number";
const CURRENT_ORDER_ID_KEY = "aulac_current_order_id";

export default function MenuListingClient({ initialMenuData, locale }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [tableNumber, setTableNumber] = useState("");
    const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingQueue, setPendingQueue] = useState<MenuItemData[]>([]);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [orderedTableNumber, setOrderedTableNumber] = useState("");
    const [orderConfirmCount, setOrderConfirmCount] = useState(0);
    const [openPopup, setOpenPopup] = useState<'cart' | 'history' | null>(null);

    // Khôi phục cart và table number từ sessionStorage/URL khi component mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                // Khôi phục cart
                const savedCart = sessionStorage.getItem(CART_STORAGE_KEY);
                if (savedCart) {
                    setCartItems(JSON.parse(savedCart));
                }

                // Khôi phục current order id
                const savedOrderId = sessionStorage.getItem(CURRENT_ORDER_ID_KEY);
                if (savedOrderId) {
                    setCurrentOrderId(Number(savedOrderId));
                }

                // Khôi phục table number từ URL params hoặc sessionStorage
                const tableFromUrl = searchParams.get("table");
                const savedTable = sessionStorage.getItem(TABLE_STORAGE_KEY);
                
                if (tableFromUrl) {
                    setTableNumber(tableFromUrl);
                    sessionStorage.setItem(TABLE_STORAGE_KEY, tableFromUrl);
                } else if (savedTable) {
                    setTableNumber(savedTable);
                }
            } catch (error) {
                console.error("Error loading from localStorage:", error);
            }
        }
    }, [searchParams]);

    // Lưu cart vào sessionStorage mỗi khi thay đổi
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
            } catch (error) {
                console.error("Error saving cart to sessionStorage:", error);
            }
        }
    }, [cartItems]);

    // Lưu table number vào sessionStorage mỗi khi thay đổi
    useEffect(() => {
        if (typeof window !== 'undefined' && tableNumber) {
            try {
                sessionStorage.setItem(TABLE_STORAGE_KEY, tableNumber);
            } catch (error) {
                console.error("Error saving table to sessionStorage:", error);
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
        // Set table number and save to sessionStorage
        setTableNumber(val);
        if (typeof window !== 'undefined') {
            sessionStorage.setItem(TABLE_STORAGE_KEY, val);
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

    const handleConfirmOrder = useCallback(async () => {
        if (cartItems.length === 0) return;

        const itemsPayload = cartItems.map(item => ({
            dishId: Number(item.id),
            quantity: item.quantity,
            price: item.price,
            note: item.note || undefined,
        }));

        // Determine the active orderId (from state or sessionStorage as fallback)
        let storedOrderId: number | null = currentOrderId;
        if (!storedOrderId && typeof window !== 'undefined') {
            const saved = sessionStorage.getItem(CURRENT_ORDER_ID_KEY);
            storedOrderId = saved ? Number(saved) : null;
        }

        try {
            if (storedOrderId) {
                // ── Case 1: existing order → append items ──────────────────
                try {
                    await api.post<ApiResponse<object>>(`/api/orders/${storedOrderId}/items`, {
                        items: itemsPayload
                    });

                    // Success – clear cart, show popup
                    setOrderedTableNumber(tableNumber);
                    setCartItems([]);
                    if (typeof window !== 'undefined') {
                        sessionStorage.removeItem(CART_STORAGE_KEY);
                    }
                    setOrderConfirmCount(prev => prev + 1);
                    setShowSuccessPopup(true);
                    return;
                } catch (err: any) {
                    // 404 → stale orderId, fall through to create a new order
                    if (err.response?.status === 404) {
                        if (typeof window !== 'undefined') {
                            sessionStorage.removeItem(CURRENT_ORDER_ID_KEY);
                        }
                        setCurrentOrderId(null);
                        storedOrderId = null;
                    } else {
                        // Other errors, throw
                        throw err;
                    }
                }
            }

            // ── Case 2: no active order → create one ───────────────────────
            let isGuest = true;
            let customerPhone: string | undefined;
            let customerFullName: string | undefined;
            let customerEmail: string | undefined;

            if (typeof window !== "undefined") {
                const raw = sessionStorage.getItem("aulac_customer_info");
                if (raw) {
                    try {
                        const info = JSON.parse(raw);
                        if (info.phoneNumber) {
                            isGuest = false;
                            customerPhone = info.phoneNumber;
                            customerFullName = info.fullName || undefined;
                            customerEmail = info.emailAddress || undefined;
                        }
                    } catch {
                        // malformed data – treat as guest
                    }
                }
            }

            const response = await api.post<ApiResponse<{ orderId: number }>>('/api/orders', {
                tableCode: tableNumber,
                isGuest,
                customerPhone,
                customerFullName,
                customerEmail,
                items: itemsPayload,
            });

            const newOrderId: number | null = response?.data?.orderId ?? null;
            if (newOrderId) {
                setCurrentOrderId(newOrderId);
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem(CURRENT_ORDER_ID_KEY, String(newOrderId));
                }
            }

            setOrderedTableNumber(tableNumber);
            setCartItems([]);
            if (typeof window !== 'undefined') {
                sessionStorage.removeItem(CART_STORAGE_KEY);
            }
            setOrderConfirmCount(prev => prev + 1);
            setShowSuccessPopup(true);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to place order";
            console.error("[Order] Failed:", err);
            alert(`Không thể tạo đơn hàng: ${message}`);
        }
    }, [cartItems, tableNumber, currentOrderId]);

    return (
        <main className="relative flex-1 min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-[#0f172a]">

            {/* Order Success Popup */}
            <AnimatePresence>
                {showSuccessPopup && (
                    <motion.div
                        key="order-success-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
                    >
                        <motion.div
                            initial={{ scale: 0.85, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.85, opacity: 0, y: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center text-center gap-4"
                        >
                            <CheckCircle className="text-[#FFAB2D]" size={64} strokeWidth={1.5} />
                            <h2 className="text-[#1A3A51] text-2xl font-bold leading-tight">
                                Order Placed<br />Successfully!
                            </h2>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Your order is being prepared and will be served shortly at{" "}
                                <span className="font-bold text-[#1A3A51]">Table {orderedTableNumber}</span>.
                            </p>
                            <button
                                onClick={() => {
                                    setShowSuccessPopup(false);
                                    // Automatically open history popup after brief delay
                                    setTimeout(() => {
                                        setOpenPopup('history');
                                    }, 300);
                                }}
                                className="mt-2 w-full bg-[#FFAB2D] hover:bg-[#FFB94D] active:bg-[#F09E20] text-white font-bold text-sm tracking-widest uppercase py-4 rounded-xl transition-colors"
                            >
                                Continue Browsing
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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


            {/* Bottom-right FAB: history + cart horizontal layout */}
            <div id="cart-destination" className="fixed bottom-6 right-4 md:bottom-8 md:right-5 z-50 pointer-events-none flex flex-row items-end gap-4">
                <AnimatePresence>
                    {tableNumber && (
                        <>
                            {/* History FAB */}
                            <motion.div
                                className="pointer-events-auto"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            >
                                <OrderHistoryFAB
                                    tableCode={tableNumber || undefined}
                                    tableNumber={tableNumber || undefined}
                                    refreshTrigger={orderConfirmCount}
                                    dishNameMap={Object.fromEntries(
                                        localizedMenu.flatMap(cat => cat.items.map(item => [Number(item.id), item.name]))
                                    )}
                                    forceClose={openPopup === 'cart'}
                                    forceOpen={openPopup === 'history'}
                                    onOpenChange={(isOpen) => setOpenPopup(isOpen ? 'history' : null)}
                                />
                            </motion.div>
                            
                            {/* Cart Summary */}
                            <motion.div
                                className="pointer-events-auto"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            >
                                <CartSummary
                                    cartItems={cartItems}
                                    tableNumber={tableNumber}
                                    onUpdateTable={setTableNumber}
                                    onUpdateQuantity={handleUpdateQuantity}
                                    onRemoveItem={handleRemoveItem}
                                    onUpdateNote={handleUpdateNote}
                                    onConfirm={handleConfirmOrder}
                                    forceClose={openPopup === 'history'}
                                    onOpenChange={(isOpen) => setOpenPopup(isOpen ? 'cart' : null)}
                                />
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}