import React from 'react';
import { MenuItemData } from '../data/mock-menu';
import Image from 'next/image';
import { Plus } from 'lucide-react';

interface PageProps {
    title: string;
    items: MenuItemData[];
    onItemClick: (item: MenuItemData) => void;
    onAddToCart?: (item: MenuItemData) => void;
}

export const RightPage = ({ title, items, onItemClick, onAddToCart }: PageProps) => {
    const fallbackImg = '/images/menu-listing/menu-grid/Tiramisu.png';

    return (
        <div className="w-full h-full relative flex flex-col font-serif overflow-hidden bg-[#FDFBF7]">
            <div
                className="absolute inset-0 bg-contain bg-center bg-no-repeat z-0 opacity-70"
                style={{ backgroundImage: 'url(/images/menu-listing/layer2B.2.1.png)' }}
            />

            {/* PADDING RESPONSIVE CHUẨN CHO 3 MÓN */}
            <div className="absolute inset-0 px-[6%] md:px-[8%] py-[6%] md:py-[8%] flex flex-col z-10">

                <div className="text-center mb-[4%] md:mb-[5%] shrink-0">
                    <h1 className="text-[12px] md:text-sm lg:text-base text-[#0f172a] font-display uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold">
                        {title}
                    </h1>
                    <div className="w-[30px] h-[1.5px] md:h-[2px] bg-[#C5A059] mx-auto mt-[2%] md:mt-[3%] shadow-sm"></div>
                </div>

                {/* DANH SÁCH 3 MÓN - ÉP CHIỀU CAO VỪA KHÍT (max-h-[31%]) ĐỂ KHÔNG BỊ TRÀN TRÊN MOBILE */}
                <div className="flex flex-col gap-[3%] md:gap-[4%] grow justify-start h-full pb-2">
                    {items.map((item, idx) => {
                        // Logic Xử lý đường dẫn ảnh từ Backend
                        let imgSrc = item.image && item.image.trim() !== '' ? item.image : fallbackImg;
                        if (imgSrc.startsWith('/uploads/')) {
                            imgSrc = `${imgSrc}`;
                        }

                        return (
                            <div
                                key={idx}
                                onClick={() => onItemClick(item)}
                                className="flex flex-row items-center gap-3 md:gap-4 bg-white/60 p-2 md:p-3 rounded-lg md:rounded-xl border border-[#C5A059]/20 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group flex-1 max-h-[31%]"
                            >
                                {/* Ảnh */}
                                <div className="w-[32%] md:w-[36%] h-full min-h-[65px] md:min-h-[80px] rounded-md md:rounded-lg overflow-hidden relative shadow-inner shrink-0">
                                    <Image
                                        src={imgSrc}
                                        alt={item.name}
                                        fill
                                        sizes="(max-width: 768px) 30vw, 20vw"
                                        style={{ objectFit: 'cover' }}
                                        className="group-hover:scale-110 transition-transform duration-700 ease-out"
                                        onError={(e) => {
                                            e.currentTarget.src = fallbackImg;
                                            e.currentTarget.srcset = fallbackImg;
                                        }}
                                    />
                                </div>

                                {/* Thông tin món */}
                                <div className="flex-1 flex flex-col py-0.5 md:py-1 pr-1 h-full justify-between overflow-hidden">
                                    <div className="overflow-hidden">
                                        <h3 className="text-[#0f172a] font-display font-bold uppercase text-[10.5px] md:text-[12px] lg:text-[14px] tracking-wide md:tracking-wider mb-0.5 md:mb-1 group-hover:text-[#C5A059] transition-colors line-clamp-1 md:line-clamp-2 leading-tight">
                                            {item.name}
                                        </h3>
                                        <p className="text-[#0f172a]/70 font-serif italic text-[9px] md:text-[10px] lg:text-[12px] line-clamp-2 leading-tight">
                                            {item.desc}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between mt-1 md:mt-auto">
                                        <span className="text-[#9A7B4F] font-bold text-[11px] md:text-[13px] lg:text-[15px]">
                                            {typeof item.price === 'number' ? `${item.price.toFixed(2)} CHF` : item.price}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onAddToCart && onAddToCart(item);
                                            }}
                                            className="w-[22px] h-[22px] md:w-7 md:h-7 rounded-full bg-[#C5A059]/10 text-[#C5A059] flex items-center justify-center hover:bg-[#C5A059] hover:text-white transition-colors shrink-0"
                                        >
                                            <Plus size={14} strokeWidth={2.5} className="md:w-[16px] md:h-[16px]" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {items.length === 0 && (
                    <div className="flex-1 flex items-center justify-center text-[#9A7B4F]/60 italic tracking-wider text-xs lg:text-sm">
                        Select a category on the left...
                    </div>
                )}
            </div>
        </div>
    );
};