import React from 'react';
import Image from 'next/image';

export interface MenuItem {
    id: string;
    name: string;
    price: string | number;
    desc: string;
    image: string;
}

interface MenuCardProps extends MenuItem {
    onOrder: (item: MenuItem, startPos: { x: number; y: number }) => void;
    onDetail?: (item: MenuItem) => void;
}

export const MenuCard = ({ id, name, price, desc, image, onOrder, onDetail }: MenuCardProps) => {

    const handleOrderClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const startPos = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        onOrder({ id, name, price, desc, image }, startPos);
    };

    const handleDetailClick = () => {
        if (onDetail) {
            onDetail({ id, name, price, desc, image });
        }
    };

    const fallbackImg = '/images/menu-listing/menu-grid/Tiramisu.png';
    const imgSrc = image && image.trim() !== '' ? image : fallbackImg;

    return (
        <div
            className="w-full flex flex-col items-center text-center group cursor-pointer bg-transparent justify-start"
            onClick={handleDetailClick}
        >
            <div className="relative w-[45%] aspect-square mb-[2%] rounded-full overflow-hidden border border-[#C5A059]/40 group-hover:border-[#C5A059] shadow-sm group-hover:shadow-md transition-all duration-500">
                <Image
                    width={300}
                    height={300}
                    src={imgSrc}
                    onError={(e) => {
                        e.currentTarget.src = fallbackImg;
                        e.currentTarget.srcset = fallbackImg;
                    }}
                    alt={name}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
                />
            </div>

            <h3 className="text-[#0f172a] font-display text-[7.5px] md:text-[8px] lg:text-[10px] xl:text-[11px] uppercase tracking-widest font-bold mb-[1%] px-[2%] line-clamp-2 transition-colors duration-300 group-hover:text-[#C5A059] leading-tight sm:leading-snug">
                {name}
            </h3>

            <div className="w-[20%] h-[1px] bg-[#C5A059]/40 mb-[1%] transition-all duration-300 group-hover:w-[40%] group-hover:bg-[#C5A059]" />

            <div className="text-[#C5A059] font-serif font-bold text-[7.5px] md:text-[8px] lg:text-[10px] xl:text-[11px] mb-[1%]">
                {typeof price === 'number' ? `${price.toFixed(2)} CHF` : price}
            </div>

            {/* ĐÃ SỬA: opacity-100 ở mobile, lg:opacity-0 ở desktop */}
            <button
                onClick={handleOrderClick}
                className="opacity-100 translate-y-0 lg:opacity-0 lg:translate-y-1 lg:group-hover:opacity-100 lg:group-hover:translate-y-0 text-[#9A7B4F] text-[6px] md:text-[7px] lg:text-[8px] xl:text-[9.5px] font-bold uppercase tracking-widest hover:text-[#0f172a] transition-all duration-300 border-b border-transparent hover:border-[#0f172a]"
            >
                Order Now
            </button>
        </div>
    );
};