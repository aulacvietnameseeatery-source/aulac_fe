import React from 'react';
import { MenuCard, MenuItem } from "./menu-card";
import { MenuItemData } from '../data/mock-menu';

interface PageProps {
    title: string;
    items: MenuItemData[];
    onItemClick: (item: MenuItemData) => void;
    onAddToCart?: (item: MenuItemData) => void;
}

export const RightPage = ({ title, items, onItemClick, onAddToCart }: PageProps) => {

    return (
        <div className="w-full h-full relative flex flex-col font-serif overflow-hidden">
            {/* CSS-Only Paper Background - Dark Theme */}
            <div className="absolute inset-0 bg-[#0B252E] z-0">
                {/* Texture Noise */}
                <div className="absolute inset-0 opacity-[0.1]"
                    style={{ backgroundImage: 'radial-gradient(#C5A059 1px, transparent 1px)', backgroundSize: '4px 4px' }}
                />

                {/* Spine Shadow Gradient (Right Side) - Darker near the spine */}
                <div className="absolute left-0 top-0 bottom-0 w-[40px] bg-gradient-to-r from-black/10 to-transparent pointer-events-none" />

                {/* Page Edge Highlight (Right) */}
                <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-white/20 pointer-events-none" />
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-y-0 left-0 w-[15%] bg-gradient-to-r from-black/40 to-transparent z-0 pointer-events-none"></div>

            <div className="absolute inset-0 px-[8%] md:px-[10%] lg:px-[12%] py-[10%] pb-[12%] flex flex-col z-10">
                {/* HEADER */}
                <div className="text-center mb-2 md:mb-4 shrink-0">
                    <h1 className="text-base md:text-lg lg:text-xl text-[#C5A059] font-display uppercase tracking-[0.2em]">{title}</h1>
                    <div className="w-8 md:w-12 h-[1px] bg-[#C5A059]/50 mx-auto mt-1"></div>
                </div>

                {/* GRID - Max 8 items */}
                <div className="grid grid-cols-2 max-[350px]:grid-cols-1 gap-x-2 md:gap-x-4 gap-y-3 md:gap-y-4 grow content-start">
                    {items.map((item, idx) => (
                        <div
                            key={idx}
                            className="" // Removed global cursor-pointer
                        >
                            <MenuCard
                                id={item.id}
                                name={item.name}
                                price={item.price}
                                desc={item.desc}
                                image={item.image}
                                onDetail={() => onItemClick(item)}
                                onOrder={() => {
                                    if (onAddToCart) {
                                        onAddToCart(item);
                                    } else {
                                        // Fallback if no add to cart handler (e.g. just show detail? user said order -> table logic)
                                        // But BookFrame usually has onAddToCart.
                                        console.log("Add to cart:", item.name);
                                    }
                                }}
                            />
                        </div>
                    ))}
                </div>

                {items.length === 0 && (
                    <div className="flex-1 flex items-center justify-center text-[#C5A059]/40 italic">
                        Select a category on the left...
                    </div>
                )}
            </div>
        </div>
    );
};
