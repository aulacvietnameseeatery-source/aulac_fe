'use client';

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { Atmosphere } from "@/features/customer/menu-listing-new/components/atmosphere";
import { BookFrame } from "@/features/customer/menu-listing-new/components/book-frame";
import { CartItem } from "@/features/customer/menu-listing-new/types/cart";

import { MenuCategory, MenuItemData } from "@/features/customer/menu-listing-new/data/mock-menu";

import { BASE_URL } from "@/lib/http";
import { TableSelectionModal } from "@/features/customer/menu-listing-new/components/table-selection-modal";
import { CartSummary } from "@/features/customer/menu-listing-new/components/cart-summary";
import { OrderHistoryFAB } from "@/features/customer/menu-listing-new/components/ordered-items-fab";


interface Props {
    // Nhận dữ liệu đã được flatten locale từ Server (plain strings)
    initialMenuData: MenuCategory[];
    tableFromUrl?: string;
}

const CART_STORAGE_KEY = "aulac_cart_items";
const TABLE_STORAGE_KEY = "aulac_table_number";
const CURRENT_ORDER_ID_KEY = "aulac_current_order_id";

export default function MenuListingClient({ initialMenuData, tableFromUrl }: Props) {
    const router = useRouter();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [tableNumber, setTableNumber] = useState("");
    const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingQueue, setPendingQueue] = useState<MenuItemData[]>([]);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [orderedTableNumber, setOrderedTableNumber] = useState("");
    const [orderConfirmCount, setOrderConfirmCount] = useState(0);

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

                // Ưu tiên table từ URL prop (đọc trên Server, không cần useSearchParams)
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
    }, [tableFromUrl]);

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

    // Locale đã được flatten trên Server — initialMenuData là MenuCategory[] thuần string
    // _OLD: const localizedMenu = useMemo(() => initialMenuData.map(cat => ({ name: cat.name[locale]... })), [initialMenuData, locale])
    const localizedMenu = initialMenuData;

    // Thêm vào giỏ hàng
    const addToCart = (itemsToAdd: MenuItemData[]) => {
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
            // _OLD: const { BASE_URL } = await import("@/lib/http"); // dynamic import replaced by static import at top

            if (storedOrderId) {
                // ── Case 1: existing order → append items ──────────────────
                const res = await fetch(`${BASE_URL}/api/orders/${storedOrderId}/items`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ items: itemsPayload }),
                });

                if (res.ok) {
                    // Success – clear cart, show popup
                    setOrderedTableNumber(tableNumber);
                    setCartItems([]);
                    if (typeof window !== 'undefined') {
                        sessionStorage.removeItem(CART_STORAGE_KEY);
                    }
                    setOrderConfirmCount(prev => prev + 1);
                    setShowSuccessPopup(true);
                    return;
                }

                if (res.status !== 404) {
                    const errBody = await res.json().catch(() => ({}));
                    throw new Error(errBody?.userMessage || `HTTP ${res.status}`);
                }

                // 404 → stale orderId, fall through to create a new order
                if (typeof window !== 'undefined') {
                    sessionStorage.removeItem(CURRENT_ORDER_ID_KEY);
                }
                setCurrentOrderId(null);
                storedOrderId = null;
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

            const createRes = await fetch(`${BASE_URL}/api/orders`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tableCode: tableNumber,
                    isGuest,
                    customerPhone,
                    customerFullName,
                    customerEmail,
                    items: itemsPayload,
                }),
            });

            if (!createRes.ok) {
                const errBody = await createRes.json().catch(() => ({}));
                throw new Error(errBody?.userMessage || `HTTP ${createRes.status}`);
            }

            const json = await createRes.json();
            const newOrderId: number | null = json?.data?.orderId ?? null;
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
                                onClick={() => setShowSuccessPopup(false)}
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


            {/* Bottom-left FAB: lịch sử đặt món */}
            <div className="fixed bottom-6 left-4 md:bottom-8 md:left-5 z-50 pointer-events-auto">
                <OrderHistoryFAB
                    tableCode={tableNumber || undefined}
                    tableNumber={tableNumber || undefined}
                    refreshTrigger={orderConfirmCount}
                    dishNameMap={Object.fromEntries(
                        localizedMenu.flatMap(cat => cat.items.map(item => [Number(item.id), item.name]))
                    )}
                />
            </div>

            {/* Bottom-right FAB: cart / confirm order */}
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
                                onConfirm={handleConfirmOrder}
                            />
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}