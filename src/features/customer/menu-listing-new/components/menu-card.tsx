import React from 'react';
import { ShoppingBag } from 'lucide-react';

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
        e.stopPropagation(); // Stop bubble to avoid triggering detail if nested (though we will un-nest)
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const startPos = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        onOrder({ id, name, price, desc, image }, startPos);
    };

    const handleDetailClick = () => {
        if (onDetail) {
            onDetail({ id, name, price, desc, image });
        }
    };

    return (
        <div className="group relative w-full aspect-[4/3] bg-[#0B252E] border border-[#C5A059]/30 shadow-lg overflow-hidden rounded-sm hover:border-[#C5A059] transition-all duration-500">
            {/* Image - Click triggers Detail */}
            <div
                className="absolute inset-0 overflow-hidden cursor-pointer"
                onClick={handleDetailClick}
            >
                <img
                    src={image || '/images/logo.png'}
                    onError={(e) => {
                        e.currentTarget.src = '/images/logo.png';
                    }}
                    alt={name}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
                />
            </div>

            {/* Gradient Overlay - Click triggers Detail */}
            <div
                className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none"
            />

            {/* Content */}
            <div className="absolute inset-0 p-2 md:p-3 flex flex-col justify-end pointer-events-none">
                {/* Top Right Price (Optional placement, user design looks different but flexible) */}
                {/* Following user design from screenshot: Price is below name */}

                <h3 className="text-[#E5D9B6] font-display text-[9px] md:text-[10px] lg:text-xs uppercase tracking-wider font-bold mb-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 line-clamp-2">
                    {name}
                </h3>

                <div className="w-6 h-[1px] bg-[#C5A059] mb-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

                <div className="flex justify-between items-end transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75 pointer-events-auto">
                    <span className="text-[#C5A059] font-display font-bold text-[9px] md:text-[10px]">
                        {typeof price === 'number' ? `${price} CHF` : price}
                    </span>

                    <button
                        onClick={handleOrderClick}
                        className="opacity-0 group-hover:opacity-100 bg-[#C5A059] text-[#0f172a] px-2 py-0.5 text-[7px] md:text-[8px] font-bold uppercase tracking-widest hover:bg-white transition-all duration-300 border border-[#C5A059] cursor-pointer"
                    >
                        Order
                    </button>
                </div>
            </div>
        </div>
    );
};
