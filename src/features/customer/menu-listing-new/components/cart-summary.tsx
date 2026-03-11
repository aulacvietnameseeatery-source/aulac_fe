"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo, useCallback, memo, useRef } from "react";
import { X, Minus, Plus, Trash2, Edit3, ShoppingBag } from "lucide-react";
import { CartItem } from "@/features/customer/menu-listing-new/types/cart";

interface CartSummaryProps {
    cartItems: CartItem[];
    tableNumber: string;
    onUpdateTable: (val: string) => void;
    onUpdateQuantity: (id: string, delta: number) => void;
    onRemoveItem: (id: string) => void;
    onUpdateNote: (id: string, note: string) => void;
    onConfirm: () => void;
    className?: string;
    forceClose?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
}

export function CartSummary({
                                cartItems = [],
                                tableNumber,
                                onUpdateTable,
                                onUpdateQuantity,
                                onRemoveItem,
                                onUpdateNote,
                                onConfirm,
                                className,
                                forceClose = false,
                                onOpenChange
                            }: CartSummaryProps) {
    const t = useTranslations("MenuListing.CartSummary");
    const controls = useAnimation();

    const [isExpanded, setIsExpanded] = useState(false);
    const [isBumping, setIsBumping] = useState(false);

    // Theo dõi thiết bị có phải Mobile không
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const totalItems = useMemo(
        () => cartItems.reduce((acc, item) => acc + item.quantity, 0),
        [cartItems]
    );
    
    const totalPrice = useMemo(
        () => cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0),
        [cartItems]
    );

    // Track previous totalItems to detect actual addition (không trigger khi +/- trong popup)
    const prevTotalItemsRef = useRef(totalItems);

    // --- 1. LOGIC ANIMATION KHI THÊM MÓN MỚI (chỉ khi chưa mở popup) ---
    useEffect(() => {
        const prev = prevTotalItemsRef.current;
        const didAddNew = totalItems > prev;
        prevTotalItemsRef.current = totalItems;

        // Chỉ chạy bump animation khi thêm món MỚI và popup chưa mở
        if (didAddNew && !isExpanded) {
            setIsBumping(true);
            const bumpTimer = setTimeout(() => setIsBumping(false), 300);

            if (!isMobile) {
                controls.start({
                    clipPath: ["inset(100% 0 0 0)", "inset(0% 0 0 0)", "inset(0 0 100% 0)"],
                    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], times: [0, 0.8, 1] }
                }).then(() => controls.set({ clipPath: "inset(100% 0 0 0)" }));
            }

            return () => clearTimeout(bumpTimer);
        }
    }, [totalItems]); // eslint-disable-line react-hooks/exhaustive-deps

    // Memoize handlers to prevent re-renders
    const handleQuantityChange = useCallback((id: string, delta: number) => {
        onUpdateQuantity(id, delta);
    }, [onUpdateQuantity]);

    const handleRemove = useCallback((id: string) => {
        onRemoveItem(id);
    }, [onRemoveItem]);

    const handleNoteChange = useCallback((id: string, note: string) => {
        onUpdateNote(id, note);
    }, [onUpdateNote]);

    const handleConfirm = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onConfirm();
    }, [onConfirm]);

    const handleExpandToggle = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(false);
        onOpenChange?.(false);
    }, [onOpenChange]);

    // Listen to forceClose prop to close popup when other popup opens
    useEffect(() => {
        if (forceClose && isExpanded) {
            setIsExpanded(false);
        }
    }, [forceClose, isExpanded]);

    // --- 2. COMPONENT CON: NỘI DUNG LÁ TO (DESKTOP) ---
    const CartContentOld = ({ isOverlay = false }: { isOverlay?: boolean }) => (
        <div className="flex flex-col items-center justify-center w-full h-full rotate-[15deg] px-8 antialiased -translate-y-4">
            <div className="flex flex-col items-center gap-3 mb-6">
                <span className={cn("text-[13px] font-display font-bold uppercase tracking-[4px] drop-shadow-sm", isOverlay ? "text-[#1A3A52]" : "text-[#C5A059]")}>
                    {tableNumber ? `Table ${tableNumber}` : "Your Table"}
                </span>
                <div className={cn("w-8 h-[1px]", isOverlay ? "bg-[#1A3A52]" : "bg-[#C5A059]")} />
            </div>

            <div className="flex flex-col items-center gap-1 mb-8">
                <span className={cn("text-[42px] font-display font-light leading-none tracking-tight", isOverlay ? "text-[#1A3A52]" : "text-white")}>
                    ${totalPrice.toFixed(2)}
                </span>
                <span className={cn("text-[10px] font-display font-medium uppercase tracking-[1.5px] mt-2", isOverlay ? "text-[#1A3A52]/80" : "text-white/70")}>
                    {t("items_count", { count: totalItems })}
                </span>
            </div>

            <button 
                onClick={handleConfirm} 
                disabled={totalItems === 0}
                className={cn(
                    "group relative w-full max-w-[170px] py-3 rounded-full flex items-center justify-center mr-2 shadow-lg transition-all duration-300",
                    totalItems === 0 
                        ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-50"
                        : isOverlay 
                            ? "bg-[#1A3A52] text-white" 
                            : "bg-[#C5A059] text-[#192339] hover:bg-[#D4AF6A] hover:-translate-y-0.5"
                )}
            >
                <span className="text-[11px] font-display font-bold uppercase tracking-[1.5px] whitespace-nowrap">{t("confirm_btn")}</span>
            </button>
        </div>
    );

    // --- 3. NỘI DUNG MỞ RỘNG (dùng useMemo thay vì component con để tránh re-mount) ---
    const expandedContent = useMemo(() => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full flex flex-col p-5 md:p-6 text-white">
            <div className="flex justify-between items-start mb-4 md:mb-6 border-b border-[#C5A059]/20 pb-4">
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-widest text-[#C5A059] flex items-center gap-2">Table <Edit3 size={10}/></label>
                    <input value={tableNumber} onChange={(e) => onUpdateTable(e.target.value)} className="bg-transparent border-none outline-none text-xl md:text-2xl font-display font-bold text-white w-24 placeholder:text-white/20 focus:text-[#C5A059]" placeholder="A-01" />
                </div>
                <button onClick={handleExpandToggle} className="p-2 -mr-2 -mt-2 text-white/50 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#C5A059]/30 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#C5A059]/60 [scrollbar-width:thin] [scrollbar-color:#c5a0594d_transparent]">
                {cartItems.map((item) => (
                    <div key={item.id} className="flex flex-col bg-[#152e42]/60 p-3 rounded-xl border border-[#C5A059]/10 shrink-0 gap-2">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="font-medium text-sm text-white/90 line-clamp-1">{item.name}</span>
                                <span className="text-xs text-[#C5A059] font-display mt-0.5">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-2 md:gap-3 ml-2">
                                <div className="flex items-center bg-[#204560] rounded-lg border border-[#C5A059]/20 h-8">
                                    <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleQuantityChange(item.id, -1);
                                        }} 
                                        className="px-2 h-full hover:bg-[#C5A059] hover:text-[#204560] rounded-l-lg text-white"
                                    >
                                        <Minus size={12} />
                                    </button>
                                    <span className="min-w-[24px] text-center text-xs font-bold text-white">{item.quantity}</span>
                                    <button 
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleQuantityChange(item.id, 1);
                                        }} 
                                        className="px-2 h-full hover:bg-[#C5A059] hover:text-[#204560] rounded-r-lg text-white"
                                    >
                                        <Plus size={12} />
                                    </button>
                                </div>
                                <button 
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemove(item.id);
                                    }} 
                                    className="text-white/30 hover:text-red-400 p-1"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <input
                            type="text"
                            defaultValue={item.note || ""}
                            onBlur={(e) => {
                                const newNote = e.target.value;
                                if (newNote !== item.note) {
                                    handleNoteChange(item.id, newNote);
                                }
                            }}
                            placeholder="Add note for chef..."
                            className="w-full bg-[#204560]/50 border border-[#C5A059]/20 rounded-lg px-2 py-1.5 text-xs text-white placeholder:text-white/30 focus:border-[#C5A059] focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                        />
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-[#C5A059]/20">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-sm uppercase tracking-wider text-white/60">Total</span>
                    <span className="text-2xl font-display font-bold text-[#C5A059]">${totalPrice.toFixed(2)}</span>
                </div>
                <button 
                    onClick={handleConfirm} 
                    disabled={totalItems === 0}
                    className={cn(
                        "w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-[2px] shadow-lg transition-all",
                        totalItems === 0 
                            ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-50"
                            : "bg-[#C5A059] text-[#192339] hover:bg-[#D4AF6A]"
                    )}
                >
                    {t("confirm_btn")}
                </button>
            </div>
        </motion.div>
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ), [cartItems, tableNumber, totalPrice, totalItems, handleExpandToggle, handleQuantityChange, handleRemove, handleNoteChange, handleConfirm, onUpdateTable, t]);

    return (
        <motion.div
            id="cart-destination"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: isBumping && !isExpanded ? 1.1 : 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={() => {
                if (!isExpanded) {
                    setIsExpanded(true);
                    onOpenChange?.(true);
                }
            }}
            style={{ willChange: 'transform, opacity' }}
            className={cn(
                "bg-[#204560] overflow-hidden transition-all duration-300 shadow-[0px_10px_40px_-10px_rgba(0,0,0,0.5)]",
                // XỬ LÝ CSS RESPONSIVE CHO 3 TRẠNG THÁI:
                isExpanded
                    ? "w-[92vw] md:w-[320px] h-[70vh] md:h-[550px] rounded-[28px] md:rounded-[24px] border border-[#C5A059]/30 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-default shadow-2xl z-[100]"
                    : isMobile
                        ? "relative w-[72px] h-[90px] rounded-tl-[60px] rounded-br-[60px] rotate-[-15deg] border-[1.5px] border-[#C5A059] bg-[#204560] cursor-pointer z-50 flex items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.6)]"
                        : "relative w-[286px] h-[357px] rounded-tl-[256px] rounded-br-[256px] rotate-[-15deg] border border-[#C5A059]/50 cursor-pointer shadow-[0px_25px_60px_-15px_rgba(0,0,0,0.6)]",
                className
            )}
        >
            <AnimatePresence mode="wait">
                {!isExpanded ? (
                    <motion.div key="collapsed-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full relative">

                        {/* 1. GIAO DIỆN LÁ MINI (CHỈ HIỆN Ở MOBILE) */}
                        {isMobile && (
                            <div className="w-full h-full flex items-center justify-center text-[#C5A059]">
                                {/* Mẹo: Vỏ lá xoay -15 độ, nên ta xoay ruột +15 độ để icon đứng thẳng */}
                                <div className="relative rotate-[15deg]">
                                    <ShoppingBag size={28} strokeWidth={2} />
                                    {/* Dấu chấm báo số lượng */}
                                    <span className="absolute -top-2 -right-2 bg-[#0f172a] text-[#C5A059] text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center border border-[#C5A059]">
                                        {totalItems}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* 2. GIAO DIỆN LÁ TO (CHỈ HIỆN Ở DESKTOP) */}
                        {!isMobile && (
                            <>
                                <div className="absolute inset-6 border border-[#C5A059]/30 rounded-[100px] pointer-events-none" />
                                <div className="absolute inset-14 border border-[#C5A059]/10 rounded-[80px] pointer-events-none" />
                                <CartContentOld isOverlay={false} />
                                <motion.div animate={controls} initial={{ clipPath: "inset(100% 0 0 0)" }} className="absolute inset-0 bg-[#C5A059] z-20 flex flex-col justify-center items-center pointer-events-none">
                                    <div className="absolute inset-6 border border-[#1A3A52]/20 rounded-[100px] pointer-events-none" />
                                    <div className="absolute inset-14 border border-[#1A3A52]/10 rounded-[80px] pointer-events-none" />
                                    <CartContentOld isOverlay={true} />
                                </motion.div>
                            </>
                        )}
                    </motion.div>
                ) : (
                    <motion.div key="expanded-content" className="w-full h-full">
                        {expandedContent}
                    </motion.div>
                )}
            </AnimatePresence>
            {!isMobile && <div className="absolute inset-4 bg-[#C5A059]/10 blur-[40px] rounded-full -z-10 pointer-events-none" />}
        </motion.div>
    );
}