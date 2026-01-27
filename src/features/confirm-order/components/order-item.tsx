"use client";

import Image from "next/image";
import { Minus, Plus } from "lucide-react"; // Cần cài lucide-react

interface OrderItemProps {
    image: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
    onIncrease?: () => void;
    onDecrease?: () => void;
}

export function OrderItem({
                              image,
                              name,
                              category,
                              price,
                              quantity,
                              onIncrease,
                              onDecrease,
                          }: OrderItemProps) {
    return (
        <div className="flex w-full items-center justify-between py-4 first:pt-0">
            {/* Left: Image & Info */}
            <div className="flex items-center gap-6">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-[2px] bg-[#F6F4EF]">
                    <Image src={image} alt={name} fill className="object-cover" />
                </div>

                <div className="flex flex-col gap-1">
                    <h3 className="font-display text-[18px] font-bold leading-[28px] text-[#1A3A52]">
                        {name}
                    </h3>
                    <span className="font-body text-[12px] font-normal uppercase tracking-[1.2px] text-[#1A3A52]/60">
            {category}
          </span>
                </div>
            </div>

            {/* Right: Quantity & Price */}
            <div className="flex items-center gap-8">

                {/* Quantity Control */}
                <div className="flex flex-col items-start gap-3">
                    <span className="font-body text-[14px] font-medium text-[#5B768B]">Quantity</span>
                    <div className="flex items-center gap-4 rounded-2xl bg-[#FAFAFA] px-4 py-3">
                        {/* Button Minus */}
                        <button
                            onClick={onDecrease}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white transition-colors hover:border-[#1A3A52]"
                        >
                            <Minus className="w-3 h-3 text-[#101519]" />
                        </button>

                        <span className="min-w-[16px] text-center font-body text-[16px] font-bold text-[#101519]">
                    {quantity}
                </span>

                        {/* Button Plus */}
                        <button
                            onClick={onIncrease}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white transition-colors hover:border-[#1A3A52]"
                        >
                            <Plus className="w-3 h-3 text-[#101519]" />
                        </button>
                    </div>
                </div>

                {/* Total Price for Item */}
                <div className="flex flex-col items-end self-end pb-3">
           <span className="font-display text-[18px] font-bold leading-[28px] text-[#1A3A52]">
             ${(price * quantity).toFixed(2)}
           </span>
                </div>
            </div>
        </div>
    );
}