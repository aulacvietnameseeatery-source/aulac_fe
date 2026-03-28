'use client';

import React, { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRouter } from "@/routing"
import { CheckCircle } from "lucide-react";
// Import toast từ thư viện sonner
import { toast } from "sonner";

import { api } from "@/lib/http";
import { ApiResponse } from "@/types/api-response.types";
import { Atmosphere } from "@/features/customer/menu-listing-new/components/atmosphere";
import { BookFrame } from "@/features/customer/menu-listing-new/components/book-frame";
import { CartItem } from "@/features/customer/menu-listing-new/types/cart";
import { MenuCategory, MenuItemData } from "@/features/customer/menu-listing-new/data/mock-menu";
import { BASE_URL } from "@/lib/http";
import { TableSelectionModal } from "@/features/customer/menu-listing-new/components/table-selection-modal";
import { CartSummary } from "@/features/customer/menu-listing-new/components/cart-summary";
import { OrderHistoryFAB } from "@/features/customer/menu-listing-new/components/ordered-items-fab";

interface Props {
    initialMenuData: MenuCategory[];
    tableFromUrl?: string;
    tokenFromUrl?: string;
}

const CART_STORAGE_KEY = "aulac_cart_items";
const TABLE_STORAGE_KEY = "aulac_table_number";
const CURRENT_ORDER_ID_KEY = "aulac_current_order_id";
const TOKEN_STORAGE_KEY = "aulac_qr_token";

export default function MenuListingClient({ initialMenuData, tableFromUrl, tokenFromUrl }: Props) {
    const router = useRouter();
    const tCommon = useTranslations("OrderPopup");
    const tMenu = useTranslations("MenuListing");
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [tableNumber, setTableNumber] = useState("");
    const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingQueue, setPendingQueue] = useState<MenuItemData[]>([]);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [orderedTableNumber, setOrderedTableNumber] = useState("");
    const [orderConfirmCount, setOrderConfirmCount] = useState(0);
    const [openPopup, setOpenPopup] = useState<'cart' | 'history' | null>(null);
    const [isValidatingTable, setIsValidatingTable] = useState(false);

    // Khôi phục cart và table number từ sessionStorage/URL
    useEffect(() => {
        if (typeof window === 'undefined') return;

        let ignored = false;

        if (!tableFromUrl) {
            sessionStorage.removeItem(TABLE_STORAGE_KEY);
            sessionStorage.removeItem(CART_STORAGE_KEY);
            sessionStorage.removeItem(CURRENT_ORDER_ID_KEY);
            sessionStorage.removeItem(TOKEN_STORAGE_KEY);
            setTableNumber("");
            setCartItems([]);
            setCurrentOrderId(null);
            return;
        }

        const savedTable = sessionStorage.getItem(TABLE_STORAGE_KEY);

        if (savedTable === tableFromUrl) {
            // Cùng tab, reload trang → tin tưởng session hiện tại
            setTableNumber(tableFromUrl);
            try {
                const savedCart = sessionStorage.getItem(CART_STORAGE_KEY);
                if (savedCart) setCartItems(JSON.parse(savedCart));
                const savedOrderId = sessionStorage.getItem(CURRENT_ORDER_ID_KEY);
                if (savedOrderId) setCurrentOrderId(Number(savedOrderId));
            } catch {
                toast.error(tMenu("err_load_cart"));
            }
        } else {
            // Tab mới hoặc copy link → xác thực quyền truy cập bàn
            setIsValidatingTable(true);
            const tokenParam = tokenFromUrl ? `?token=${encodeURIComponent(tokenFromUrl)}` : '';
            api.post(`/api/public/tables/${encodeURIComponent(tableFromUrl)}/occupy${tokenParam}`, {})
                .then(() => {
                    if (ignored) return;
                    // Bàn trống, occupy thành công → cho phép truy cập
                    setTableNumber(tableFromUrl);
                    sessionStorage.setItem(TABLE_STORAGE_KEY, tableFromUrl);
                    if (tokenFromUrl) {
                        sessionStorage.setItem(TOKEN_STORAGE_KEY, tokenFromUrl);
                    }
                })
                .catch((error: any) => {
                    if (ignored) return;
                    if (error.response?.status === 409) {
                        toast.error(tMenu("err_table_occupied_access"));
                    } else if (error.response?.status === 404) {
                        toast.error(tMenu("err_table_not_found"));
                    } else if (error.response?.status === 400) {
                        toast.error(tMenu("err_qr_invalid"));
                    } else {
                        toast.error(tMenu("err_table_validation"));
                    }
                    // Xóa table param khỏi URL và chuyển về trang menu không có bàn
                    sessionStorage.removeItem(TABLE_STORAGE_KEY);
                    sessionStorage.removeItem(CART_STORAGE_KEY);
                    sessionStorage.removeItem(CURRENT_ORDER_ID_KEY);
                    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
                    setTableNumber("");
                    setCartItems([]);
                    setCurrentOrderId(null);
                    router.replace('/menu-listing');
                })
                .finally(() => { if (!ignored) setIsValidatingTable(false); });
        }

        return () => { ignored = true; };
    }, [tableFromUrl, tokenFromUrl, router]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
            } catch (error) {
                toast.error(tMenu("err_save_cart"));
            }
        }
    }, [cartItems]);

    useEffect(() => {
        if (typeof window !== 'undefined' && tableNumber) {
            try {
                sessionStorage.setItem(TABLE_STORAGE_KEY, tableNumber);
            } catch (error) {
                toast.error(tMenu("err_save_table"));
            }
        }
    }, [tableNumber]);

    const localizedMenu = React.useMemo(() => {
        if (!initialMenuData) return [];

        return [...initialMenuData].sort((a, b) => {
            const orderA = a.displayOrder ?? 999;
            const orderB = b.displayOrder ?? 999;
            return orderA - orderB;
        });
    }, [initialMenuData]);

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
                        name: newItem.name,
                        price: priceNumber,
                        quantity: 1,
                        image: newItem.image
                    });
                }
            });
            return newCart;
        });
        // Hiển thị thông báo bên ngoài setCartItems để tránh bị gọi 2 lần (React StrictMode)
        if (itemsToAdd.length === 1) {
            toast.success(tCommon("toast_added_single", { dishName: itemsToAdd[0].name }));
        } else {
            toast.success(tCommon("toast_added_multiple", { count: itemsToAdd.length }));
        }
    };

    const handleAddToCartFromBook = (item: any) => {
        if (!tableNumber) {
            setPendingQueue(prev => [...prev, item]);
            setIsModalOpen(true);
        } else {
            addToCart([item]);
        }
    };

    const handleTableConfirm = async (val: string, qrToken?: string) => {
        setTableNumber(val);
        if (typeof window !== 'undefined') {
            sessionStorage.setItem(TABLE_STORAGE_KEY, val);
        }

        // Occupy the table directly (no customer info page)
        try {
            const tokenParam = qrToken ? `?token=${encodeURIComponent(qrToken)}` : '';
            await api.post(`/api/public/tables/${encodeURIComponent(val)}/occupy${tokenParam}`, {});
            if (qrToken && typeof window !== 'undefined') {
                sessionStorage.setItem(TOKEN_STORAGE_KEY, qrToken);
            }
        } catch (error: any) {
            if (error.response?.status === 409) {
                toast.error(tMenu("err_table_occupied_select"));
                if (typeof window !== 'undefined') {
                    sessionStorage.removeItem(TABLE_STORAGE_KEY);
                    sessionStorage.removeItem(CART_STORAGE_KEY);
                    sessionStorage.removeItem(CURRENT_ORDER_ID_KEY);
                    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
                }
                setTableNumber("");
                setCartItems([]);
                setCurrentOrderId(null);
                return;
            }
            // For other errors, don't block user flow
        }

        if (pendingQueue.length > 0) {
            addToCart(pendingQueue);
            setPendingQueue([]);
        }

        setIsModalOpen(false);
        const tokenQuery = qrToken ? `&token=${encodeURIComponent(qrToken)}` : '';
        router.push(`/menu-listing?table=${encodeURIComponent(val)}${tokenQuery}`);
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

        let storedOrderId: number | null = currentOrderId;
        if (!storedOrderId && typeof window !== 'undefined') {
            const saved = sessionStorage.getItem(CURRENT_ORDER_ID_KEY);
            storedOrderId = saved ? Number(saved) : null;
        }

        // Get QR token from sessionStorage
        let qrToken: string | null = null;
        if (typeof window !== 'undefined') {
            qrToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
        }

        try {
            if (storedOrderId) {
                try {
                    await api.post<ApiResponse<object>>(`/api/orders/${storedOrderId}/items`, {
                        items: itemsPayload
                    });

                    setOrderedTableNumber(tableNumber);
                    setCartItems([]);
                    if (typeof window !== 'undefined') {
                        sessionStorage.removeItem(CART_STORAGE_KEY);
                    }
                    setOrderConfirmCount(prev => prev + 1);
                    setShowSuccessPopup(true);
                    return;
                } catch (err: any) {
                    if (err.response?.status === 404) {
                        if (typeof window !== 'undefined') {
                            sessionStorage.removeItem(CURRENT_ORDER_ID_KEY);
                        }
                        setCurrentOrderId(null);
                        storedOrderId = null;
                    } else {
                        throw err;
                    }
                }
            }

            const response = await api.post<ApiResponse<{ orderId: number }>>('/api/orders', {
                tableCode: tableNumber,
                qrToken: qrToken || undefined, // Include QR token if available
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
        } catch (err: any) {
            // Handle specific error cases
            if (err.response?.status === 409) {
                // Table is already occupied by another customer
                toast.error(tMenu("err_table_occupied_select"));
                // Clear the session and redirect to menu without table
                if (typeof window !== 'undefined') {
                    sessionStorage.removeItem(TABLE_STORAGE_KEY);
                    sessionStorage.removeItem(CART_STORAGE_KEY);
                    sessionStorage.removeItem(CURRENT_ORDER_ID_KEY);
                    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
                }
                setTableNumber("");
                setCartItems([]);
                setCurrentOrderId(null);
                router.push('/menu-listing');
            } else if (err.response?.status === 400 && err.response?.data?.userMessage?.includes('QR')) {
                // Invalid QR token
                toast.error(tMenu("err_qr_invalid"));
                if (typeof window !== 'undefined') {
                    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
                }
            } else {
                // Generic error
                const message = err.response?.data?.userMessage || err.message || "";
                toast.error(tMenu("err_create_order", { message }));
            }
        }
    }, [cartItems, tableNumber, currentOrderId]);

    return (
        <main className="relative flex-1 min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-[#0f172a]">

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
                            <h2 className="text-[#1A3A51] text-2xl font-bold font-serif leading-tight">
                                {tMenu("success_order_title")}
                            </h2>
                            <p className="text-slate-500 text-sm font-serif leading-relaxed">
                                {tMenu("success_order_body", { table: orderedTableNumber })}
                            </p>
                            <button
                                onClick={() => {
                                    setShowSuccessPopup(false);
                                    setTimeout(() => {
                                        setOpenPopup('history');
                                    }, 300);
                                }}
                                className="mt-2 w-full bg-[#C5A059] hover:bg-[#b08c4a] active:bg-[#9c7a3f] text-white font-bold font-serif text-sm tracking-widest uppercase py-4 rounded-xl transition-colors"
                            >
                                {tMenu("success_continue")}
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

            <div id="cart-destination" className="fixed bottom-6 md:bottom-8 inset-x-0 z-50 pointer-events-none flex flex-row items-end justify-center md:justify-end md:pr-8 gap-4 md:gap-2">
                <AnimatePresence>
                    {tableNumber && (
                        <>
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