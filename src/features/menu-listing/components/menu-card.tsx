"use client";

import Image from "next/image";

// 1. Export Interface để dùng chung ở các file khác
export interface OrderEvent {
    item: MenuItem;
    startPos: { x: number; y: number; img: string };
}

export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    tagColor?: "default" | "gold" | "dark";
}

interface MenuCardProps {
    item: MenuItem;
    // Nhận hàm callback từ cha
    onOrder?: (event: OrderEvent) => void;
}

export function MenuCard({ item, onOrder }: MenuCardProps) {
    const handleOrderClick = (e: React.MouseEvent) => {
        // 1. Lấy vị trí của nút bấm (Điểm xuất phát)
        const rect = (e.target as HTMLElement).getBoundingClientRect();

        // 2. Gửi thông tin lên cha
        onOrder?.({
            item,
            startPos: {
                x: rect.left + rect.width / 2, // Lấy tâm nút bấm
                y: rect.top + rect.height / 2,
                img: item.image
            }
        });
    };

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0px_2px_4px_-2px_rgba(0,0,0,0.1)] outline outline-1 outline-[#E8E4DF] transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            {/* === IMAGE SECTION === */}
            <div className="relative h-[224px] w-full bg-[#F5F3F0] overflow-hidden">
                <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute left-4 top-4 rounded-full bg-[#D4A574] px-3 py-1.5 shadow-sm">
                    <span className="block text-[12px] font-semibold uppercase tracking-[0.3px] text-[#1A3A52]">
                        {item.category}
                    </span>
                </div>
            </div>

            {/* === CONTENT SECTION === */}
            <div className="flex flex-1 flex-col p-6">
                <h3 className="mb-2 font-display text-[20px] font-bold leading-[28px] text-[#0A0A0A]">
                    {item.name}
                </h3>
                <p className="mb-6 line-clamp-3 flex-1 font-body text-[14px] leading-[22px] text-[#7A7A7A]">
                    {item.description}
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-[#E8E4DF] pt-6">
                    <span className="font-body text-[20px] font-bold text-[#D4A574]">
                        ${item.price}
                    </span>
                    <button
                        onClick={handleOrderClick}
                        className="rounded-lg bg-[#D4A574] px-4 py-2 font-body text-[14px] font-medium text-[#1A3A52] transition-colors hover:bg-[#C39462] active:scale-95"
                    >
                        Order Now
                    </button>
                </div>
            </div>
        </div>
    );
}