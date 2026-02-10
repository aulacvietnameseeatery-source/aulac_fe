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
            {/* Ornate Frame Background */}
            <div 
                className="absolute inset-0 bg-contain bg-center bg-no-repeat z-0"
                style={{ backgroundImage: 'url(/images/menu-listing/ornate-frame.png)' }}
            />

            <div className="absolute inset-0 px-[6%] sm:px-[7%] md:px-[8%] py-[5%] md:py-[6%] pb-[6%] md:pb-[7%] flex flex-col z-10">
                {/* HEADER */}
                <div className="text-center mb-2 md:mb-3 lg:mb-4 shrink-0">
                    <h1 className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-[#C5A059] font-display uppercase tracking-[0.2em]">{title}</h1>
                    <div className="w-6 sm:w-8 md:w-10 lg:w-12 h-[1px] bg-[#C5A059]/50 mx-auto mt-1"></div>
                </div>

                {/* GRID - Max 6 items */}
                <div className="grid grid-cols-2 gap-x-2 sm:gap-x-3 md:gap-x-4 lg:gap-x-5 gap-y-2 sm:gap-y-3 md:gap-y-4 lg:gap-y-5 grow content-start">
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
