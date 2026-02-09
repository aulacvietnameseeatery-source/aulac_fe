"use client";

import Image from 'next/image';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Interface dữ liệu món ăn
export interface MenuItem {
    id: string;
    name: string;
    price: number | string;
    image: string;
    // Các trường phụ nếu cần
    desc?: string;
}

interface MenuCardProps extends MenuItem {
    onOrder?: (item: MenuItem, startPos: { x: number; y: number }) => void;
}

export const MenuCard = (props: MenuCardProps) => {
    const { id, name, price, image, desc, onOrder } = props;
    const [isAdded, setIsAdded] = useState(false);

    const handleOrder = (e: React.MouseEvent) => {
        e.stopPropagation();

        // 1. Hiệu ứng visual
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);

        // 2. Lấy tọa độ để bắn hiệu ứng bay
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const startPos = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };

        // 3. Gọi hàm cha
        if (onOrder) {
            // Chuyển đổi giá string "45 CHF" sang number 45 để tính toán
            const numericPrice = parseFloat(price.toString().replace(/[^0-9.]/g, ''));
            onOrder({ id, name, price: numericPrice, image }, startPos);
        }
    };

    return (
        <motion.div
            // HIỆU ỨNG NHẤC ĐĨA (Plate Lift)
            animate={{
                y: isAdded ? -5 : 0,
                scale: isAdded ? 1.02 : 1
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex flex-col items-center text-center group h-full justify-between relative z-10"
        >
            {/* Khung ảnh */}
            <div className="w-full aspect-[3/2] relative border border-[#C5A059] p-[2px] mb-1 bg-[#0f172a]/60 shadow-md group-hover:shadow-[#C5A059]/20 transition-all">
                <div className="absolute inset-[2px] border border-[#C5A059]/30 z-20 pointer-events-none"></div>
                <div className="relative w-full h-full overflow-hidden">
                    {image ? (
                        <Image src={image} alt={name} fill className="object-cover" sizes="(max-width: 768px) 50vw, 33vw"/>
                    ) : (
                        <div className="w-full h-full bg-[#1e293b] flex items-center justify-center">
                            <span className="text-[#C5A059]/30 text-[8px]">NO IMAGE</span>
                        </div>
                    )}
                </div>
            </div>

            <h3 className="text-[#C5A059] font-display text-xs lg:text-[13px] font-bold uppercase tracking-wide leading-tight line-clamp-1">
                {name}
            </h3>

            {/* Footer Card */}
            <div className="mt-1 flex items-center gap-3 border-t border-[#C5A059]/10 pt-1 w-full justify-center">
                <span className="text-white font-display font-bold text-xs">{price}</span>

                {/* --- NÚT ORDER CÓ HIỆU ỨNG --- */}
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleOrder}
                    className="relative overflow-hidden text-[8px] border border-[#C5A059] px-2 py-[1px] uppercase tracking-wider transition-colors group/btn"
                >
                    {/* Background đổi màu khi Added */}
                    <motion.div
                        className="absolute inset-0 z-0 bg-[#C5A059]"
                        initial={{ x: "-100%" }}
                        animate={{ x: isAdded ? "0%" : "-100%" }}
                    />

                    {/* Hiệu ứng Shine (Vệt sáng quét qua) */}
                    {!isAdded && (
                        <div className="absolute inset-0 z-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] transition-transform duration-1000 group-hover/btn:translate-x-[150%]" />
                    )}

                    {/* Text nội dung */}
                    <span className={`relative z-10 font-bold ${isAdded ? 'text-[#0f172a]' : 'text-[#C5A059] group-hover/btn:text-[#C5A059]'}`}>
                        {isAdded ? 'Added' : 'Order'}
                    </span>
                </motion.button>
            </div>
        </motion.div>
    );
};