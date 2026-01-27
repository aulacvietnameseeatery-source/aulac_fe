"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react"; // Import icon Check

type DiningType = "dine-in" | "take-away";

export function DiningOption() {
    const [selected, setSelected] = useState<DiningType>("dine-in");

    return (
        <div className="flex w-full flex-col items-start gap-8">
            {/* Header */}
            <div className="flex w-full flex-col items-center gap-2 border-b-4 border-transparent">
         <span className="font-body text-[12px] font-bold uppercase tracking-[3.6px] text-[#C9A961]">
            How would you like to enjoy?
         </span>
                <h2 className="font-display text-[24px] font-bold leading-[32px] text-[#1A3A52]">
                    Dining Option
                </h2>
            </div>

            {/* Options Grid (2 Cột) */}
            <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">

                {/* === OPTION 1: DINE-IN === */}
                <div
                    onClick={() => setSelected("dine-in")}
                    className={cn(
                        "group relative h-[400px] w-full cursor-pointer overflow-hidden rounded-[24px] transition-all duration-300",
                        // Logic Style khi chọn: Viền vàng + Shadow đậm
                        selected === "dine-in"
                            ? "ring-2 ring-[#C5A059] ring-offset-2 shadow-xl scale-[1.02]"
                            : "opacity-80 hover:opacity-100 hover:scale-[1.01]"
                    )}
                >
                    <Image
                        src="/images/confirm-order/dining-option/dining option.png" // Ảnh không gian nhà hàng
                        alt="Dine In"
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121721]/90 via-[#121721]/20 to-transparent" />

                    {/* Checkbox Indicator */}
                    <div className={cn(
                        "absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300",
                        selected === "dine-in"
                            ? "bg-[#C5A059] border-[#C5A059] text-[#1A3A52]"
                            : "bg-white/10 border-white/30 text-transparent"
                    )}>
                        <Check className="h-5 w-5" />
                    </div>

                    <div className="absolute bottom-0 left-0 flex w-full flex-col p-8">
                <span className="font-serif text-[10px] font-bold uppercase tracking-[2px] text-[#C5A059]">
                    The Experience
                </span>
                        <h3 className="mt-2 font-serif text-[28px] font-light leading-none text-white">
                            Dine-In
                        </h3>
                        <p className="mt-3 font-serif text-[13px] leading-[20px] text-white/70">
                            Immerse yourself in our tranquil atmosphere with full service.
                        </p>
                    </div>
                </div>

                {/* === OPTION 2: TAKE AWAY === */}
                <div
                    onClick={() => setSelected("take-away")}
                    className={cn(
                        "group relative h-[400px] w-full cursor-pointer overflow-hidden rounded-[24px] transition-all duration-300",
                        selected === "take-away"
                            ? "ring-2 ring-[#C5A059] ring-offset-2 shadow-xl scale-[1.02]"
                            : "opacity-80 hover:opacity-100 hover:scale-[1.01]"
                    )}
                >
                    <Image
                        src="/images/confirm-order/dining-option/take away option.png"
                        alt="Take Away"
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121721]/90 via-[#121721]/20 to-transparent" />

                    {/* Checkbox Indicator */}
                    <div className={cn(
                        "absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300",
                        selected === "take-away"
                            ? "bg-[#C5A059] border-[#C5A059] text-[#1A3A52]"
                            : "bg-white/10 border-white/30 text-transparent"
                    )}>
                        <Check className="h-5 w-5" />
                    </div>

                    <div className="absolute bottom-0 left-0 flex w-full flex-col p-8">
                <span className="font-serif text-[10px] font-bold uppercase tracking-[2px] text-[#C5A059]">
                    Quick & Fresh
                </span>
                        <h3 className="mt-2 font-serif text-[28px] font-light leading-none text-white">
                            Take Away
                        </h3>
                        <p className="mt-3 font-serif text-[13px] leading-[20px] text-white/70">
                            Enjoy our exquisite flavors in the comfort of your own home.
                        </p>
                    </div>
                </div>

            </div>

            {/* Action Line - Thay đổi dựa theo lựa chọn */}
            <div className="flex w-full flex-col items-center gap-6 pt-4">

                {/* Helper Text */}
                <div className="flex items-center gap-3">
                    <div className="flex h-[22px] w-[18px] items-center justify-center">
                        <div className="h-[15px] w-[15px] bg-[#C9A961] rounded-[2px]" />
                    </div>
                    <span className="font-body text-[14px] font-medium text-[#1A3A52]/70">
                {selected === "dine-in"
                    ? "Proceed to select your preferred table."
                    : "Proceed to schedule pickup time."}
             </span>
                </div>

                {/* Nút Tiếp Tục */}
                <Link
                    href={selected === "dine-in" ? "/selection-table" : "/checkout"}
                    className="group flex h-[56px] w-full items-center justify-center gap-2 rounded-full bg-[#1A3A52] text-white shadow-lg transition-all hover:bg-[#234b6b] hover:shadow-xl active:scale-95"
                >
            <span className="font-display text-[16px] font-bold tracking-widest uppercase">
                {selected === "dine-in" ? "Select Table" : "Go to Checkout"}
            </span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>

            </div>
        </div>
    );
}