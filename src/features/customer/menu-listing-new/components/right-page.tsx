import React from 'react';
import { MenuCard } from "./menu-card";
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
            <div
                className="absolute inset-0 bg-contain bg-center bg-no-repeat z-0 drop-shadow-2xl"
                style={{ backgroundImage: 'url(/images/menu-listing/layer2B.2.1.png)' }}
            />

            {/* Đã giảm pt (padding-top) và pb (padding-bottom) xuống để tăng không gian chứa món ăn */}
            <div className="absolute inset-0 px-[8%] pt-[5%] pb-[4%] flex flex-col z-10">

                {/* Giảm margin-bottom của header xuống còn 2% */}
                <div className="text-center mb-[2%] shrink-0">
                    <h1 className="text-[10px] md:text-xs lg:text-sm xl:text-base 2xl:text-lg text-[#9A7B4F] font-display uppercase tracking-[0.2em] font-bold drop-shadow-sm">
                        {title}
                    </h1>
                    <div className="w-[15%] h-[1px] bg-[#9A7B4F]/40 mx-auto mt-[2%]"></div>
                </div>

                {/* Giảm gap-y xuống còn 1% để 3 hàng xích lại gần nhau hơn */}
                <div className="grid grid-cols-2 gap-x-[10%] gap-y-[1%] grow content-start">
                    {items.map((item, idx) => (
                        <div key={idx}>
                            <MenuCard
                                id={item.id}
                                name={item.name}
                                price={item.price}
                                desc={item.desc}
                                image={item.image}
                                onDetail={() => onItemClick(item)}
                                onOrder={(itemData, pos) => {
                                    if (onAddToCart) {
                                        onAddToCart(itemData);
                                    } else {
                                        console.log("Add to cart:", itemData.name);
                                    }
                                }}
                            />
                        </div>
                    ))}
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