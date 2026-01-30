"use client";

import Image from "next/image";
import Link from "next/link"; // 👈 Import Link
import { useTranslations } from "next-intl";

export interface OrderEvent {
    item: MenuItem;
    startPos: { x: number; y: number; img: string };
}

export interface MenuItem {
    id: string;
    price: number;
    image: string;
    category: string;
    translationKey: string;
    tagColor?: "default" | "gold" | "dark";
}

interface MenuCardProps {
    item: MenuItem;
    onOrder?: (event: OrderEvent) => void;
}

export function MenuCard({ item, onOrder }: MenuCardProps) {
    const tGrid = useTranslations("MenuListing.MenuGrid");
    const tFilter = useTranslations("MenuListing.FilterBar");

    const handleOrderClick = (e: React.MouseEvent) => {
        // Ngăn chặn sự kiện click lan ra ngoài (để không bị kích hoạt Link khi bấm nút Order)
        e.preventDefault();
        e.stopPropagation();

        const rect = (e.target as HTMLElement).getBoundingClientRect();
        onOrder?.({
            item,
            startPos: {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
                img: item.image
            }
        });
    };

    const name = tGrid(`items.${item.translationKey}_name` as never);
    const description = tGrid(`items.${item.translationKey}_desc` as never);
    const categoryLabel = tFilter(item.category.toLowerCase() as never);

    // 👇 Đường dẫn tới trang chi tiết
    const detailHref = `/dish-details/${item.id}`;

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0px_2px_4px_-2px_rgba(0,0,0,0.1)] outline outline-1 outline-[#E8E4DF] transition-all duration-300 hover:shadow-lg hover:-translate-y-1">

            {/* === 1. BỌC IMAGE BẰNG LINK === */}
            <Link href={detailHref} className="relative h-[224px] w-full bg-[#F5F3F0] overflow-hidden block cursor-pointer">
                <Image
                    src={item.image}
                    alt={name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute left-4 top-4 rounded-full bg-[#D4A574] px-3 py-1.5 shadow-sm">
                    <span className="block text-[12px] font-semibold uppercase tracking-[0.3px] text-[#1A3A52]">
                        {categoryLabel}
                    </span>
                </div>
            </Link>

            {/* === CONTENT SECTION === */}
            <div className="flex flex-1 flex-col p-6">

                {/* === 2. BỌC TÊN MÓN ĂN BẰNG LINK === */}
                <Link href={detailHref} className="block mb-2">
                    <h3 className="font-display text-[20px] font-bold leading-[28px] text-[#0A0A0A] transition-colors hover:text-[#D4A574]">
                        {name}
                    </h3>
                </Link>

                <p className="mb-6 line-clamp-3 flex-1 font-body text-[14px] leading-[22px] text-[#7A7A7A]">
                    {description}
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-[#E8E4DF] pt-6">
                    <span className="font-body text-[20px] font-bold text-[#D4A574]">
                        ${item.price}
                    </span>

                    {/* Nút Order giữ nguyên, đã có e.preventDefault() ở trên */}
                    <button
                        onClick={handleOrderClick}
                        className="rounded-lg bg-[#D4A574] px-4 py-2 font-body text-[14px] font-medium text-[#1A3A52] transition-colors hover:bg-[#C39462] active:scale-95"
                    >
                        {tGrid("order_btn")}
                    </button>
                </div>
            </div>
        </div>
    );
}