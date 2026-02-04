"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

interface CartSummaryProps {
    totalPrice?: number;
    totalItems?: number;
    onConfirm?: () => void;
    className?: string;
}

export function CartSummary({
                                totalPrice = 0,
                                totalItems = 0,
                                onConfirm,
                                className
                            }: CartSummaryProps) {
    const t = useTranslations("MenuListing.CartSummary");
    const controls = useAnimation();

    useEffect(() => {
        if (totalItems > 0) {
            // Animation: Quét từ 0% lên 100% rồi biến mất (hoặc reset)
            // Chúng ta dùng clipPath để "quét" layer màu vàng lên trên layer xanh
            controls.start({
                clipPath: [
                    "inset(100% 0 0 0)", // Bắt đầu: Che hoàn toàn (từ dưới)
                    "inset(0% 0 0 0)",   // Giữa: Hiện toàn bộ (Full vàng)
                    "inset(0 0 100% 0)"  // Kết thúc: Biến mất lên trên
                ],
                transition: {
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1], // Ease mượt (custom bezier)
                    times: [0, 0.8, 1] // Lên nhanh, giữ một chút rồi lướt đi
                }
            }).then(() => {
                // Reset về trạng thái ban đầu để sẵn sàng cho lần sau
                controls.set({ clipPath: "inset(100% 0 0 0)" });
            });
        }
    }, [totalItems, controls]);

    // Component con hiển thị nội dung để tránh lặp code
    const CartContent = ({ isOverlay = false }: { isOverlay?: boolean }) => (
        <div className="flex flex-col items-center justify-center w-full h-full rotate-[15deg] px-8 antialiased -translate-y-4">
            <div className="flex flex-col items-center gap-3 mb-6">
                <span className={cn(
                    "text-[11px] font-display font-bold uppercase tracking-[4px] drop-shadow-sm",
                    isOverlay ? "text-[#1A3A52]" : "text-[#C5A059]" // Đảo màu: Overlay dùng màu Xanh Navy
                )}>
                    {t("title")}
                </span>
                <div className={cn("w-6 h-[1px]", isOverlay ? "bg-[#1A3A52]" : "bg-[#C5A059]")} />
            </div>

            <div className="flex flex-col items-center gap-1 mb-8">
                <span className={cn(
                    "text-[42px] font-display font-light leading-none tracking-tight",
                    isOverlay ? "text-[#1A3A52]" : "text-white" // Đảo màu: Overlay dùng màu Xanh Navy
                )}>
                    ${totalPrice.toFixed(2)}
                </span>
                <span className={cn(
                    "text-[10px] font-display font-medium uppercase tracking-[1.5px] mt-2",
                    isOverlay ? "text-[#1A3A52]/80" : "text-white/70"
                )}>
                    {t("items_count", { count: totalItems })}
                </span>
            </div>

            <button
                onClick={onConfirm}
                className={cn(
                    "group relative w-full max-w-[170px] py-3 rounded-full flex items-center justify-center mr-2 shadow-lg transition-all duration-300",
                    // Đảo màu nút:
                    // - Mặc định: Nền Vàng, Chữ Xanh
                    // - Overlay (khi nền đã vàng): Nền Xanh, Chữ Vàng (hoặc Trắng)
                    isOverlay
                        ? "bg-[#1A3A52] text-white"
                        : "bg-[#C5A059] text-[#192339] hover:bg-[#D4AF6A] hover:-translate-y-0.5"
                )}
            >
                <span className="text-[11px] font-display font-bold uppercase tracking-[1.5px] whitespace-nowrap">
                   {t("confirm_btn")}
                </span>
            </button>
        </div>
    );

    return (
        <motion.div
            id="cart-destination"
            initial={{ x: "120%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "120%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 60, damping: 15 }}
            className={cn("relative w-[286px] h-[357px]", className)}
        >
            <div className="w-full h-full">
                {/* === KHUNG CHIẾC LÁ CHÍNH === */}
                <div
                    className={cn(
                        "relative w-full h-full flex flex-col justify-center items-center",
                        "rotate-[-15deg] origin-center",
                        "bg-[#204560]", // NỀN GỐC: XANH NAVY
                        "rounded-tl-[256px] rounded-br-[256px]",
                        "border border-[#C5A059]/50",
                        "shadow-[0px_25px_60px_-15px_rgba(0,0,0,0.6)]",
                        "overflow-hidden" // Quan trọng
                    )}
                >
                    {/* --- LAYER 1: NỘI DUNG GỐC (Mặc định) --- */}
                    {/* Họa tiết trang trí */}
                    <div className="absolute inset-6 border border-[#C5A059]/30 rounded-[100px] pointer-events-none" />
                    <div className="absolute inset-14 border border-[#C5A059]/10 rounded-[80px] pointer-events-none" />

                    {/* Nội dung tĩnh */}
                    <CartContent isOverlay={false} />


                    {/* --- LAYER 2: NỘI DUNG ĐẢO MÀU (Animation Overlay) --- */}
                    <motion.div
                        animate={controls}
                        initial={{ clipPath: "inset(100% 0 0 0)" }} // Ban đầu bị che hoàn toàn từ dưới
                        className="absolute inset-0 bg-[#C5A059] z-20 flex flex-col justify-center items-center" // NỀN HIỆU ỨNG: VÀNG
                    >
                        {/* Họa tiết trang trí (Màu tối cho tương phản trên nền vàng) */}
                        <div className="absolute inset-6 border border-[#1A3A52]/20 rounded-[100px] pointer-events-none" />
                        <div className="absolute inset-14 border border-[#1A3A52]/10 rounded-[80px] pointer-events-none" />

                        {/* Nội dung đã đảo màu */}
                        <CartContent isOverlay={true} />
                    </motion.div>

                </div>

                {/* Glow Effect nền sau */}
                <div className="absolute inset-4 bg-[#C5A059]/10 blur-[40px] rounded-full -z-10 pointer-events-none" />
            </div>
        </motion.div>
    );
}