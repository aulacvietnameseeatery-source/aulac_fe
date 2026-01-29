"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl"; // Import hook

interface CartSummaryProps {
    totalPrice?: number;
    totalItems?: number;
    onConfirm?: () => void;
    className?: string;
}

export function CartSummary({
                                totalPrice = 124.00,
                                totalItems = 3,
                                onConfirm,
                                className
                            }: CartSummaryProps) {
    const t = useTranslations("MenuListing.CartSummary");

    return (
        <div
            id="cart-destination"
            className={cn("relative w-[286px] h-[357px]", className)}>

            {/* === KHUNG CHIẾC LÁ (Giữ nguyên) === */}
            <div
                className={cn(
                    "relative w-full h-full flex flex-col justify-center items-center z-10",
                    "rotate-[-15deg] origin-center",
                    "bg-[#204560]",
                    "rounded-tl-[256px] rounded-br-[256px]",
                    "border border-[#C5A059]/50",
                    "shadow-[0px_25px_60px_-15px_rgba(0,0,0,0.6)]",
                    "overflow-hidden"
                )}
            >
                {/* --- HỌA TIẾT TRANG TRÍ (Giữ nguyên) --- */}
                <div className="absolute inset-6 border border-[#C5A059]/30 rounded-[100px] pointer-events-none" />
                <div className="absolute inset-14 border border-[#C5A059]/10 rounded-[80px] pointer-events-none" />

                {/* === NỘI DUNG === */}
                <div className="flex flex-col items-center justify-center w-full h-full rotate-[15deg] px-8 antialiased -translate-y-4">

                    {/* Header */}
                    <div className="flex flex-col items-center gap-3 mb-6">
                        <span className="text-[#C5A059] text-[11px] font-display font-bold uppercase tracking-[4px] drop-shadow-sm">
                            {t("title")}
                        </span>
                        <div className="w-6 h-[1px] bg-[#C5A059]" />
                    </div>

                    {/* Giá tiền & Số lượng */}
                    <div className="flex flex-col items-center gap-1 mb-8">
                        <span className="text-white text-[42px] font-display font-light leading-none tracking-tight">
                            ${totalPrice.toFixed(2)}
                        </span>

                        <span className="text-white/70 text-[10px] font-display font-medium uppercase tracking-[1.5px] mt-2">
                            {/* Dùng t() với tham số count */}
                            {t("items_count", { count: totalItems })}
                        </span>
                    </div>

                    {/* Nút CONFIRM ORDER */}
                    <button
                        onClick={onConfirm}
                        className={cn(
                            "group relative w-full max-w-[170px] py-3 rounded-full bg-[#C5A059]",
                            "flex items-center justify-center",
                            "mr-2",
                            "shadow-lg transition-all duration-300",
                            "hover:bg-[#D4AF6A] hover:shadow-[0px_5px_20px_rgba(197,160,89,0.5)] hover:-translate-y-0.5 active:translate-y-0"
                        )}
                    >
                        <span className="text-[#192339] text-[11px] font-display font-bold uppercase tracking-[1.5px] whitespace-nowrap">
                           {t("confirm_btn")}
                        </span>
                    </button>
                </div>
            </div>

            {/* Glow Effect */}
            <div className="absolute inset-4 bg-[#C5A059]/10 blur-[40px] rounded-full -z-10 pointer-events-none" />
        </div>
    );
}