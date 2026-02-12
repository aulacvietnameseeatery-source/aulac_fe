import React from 'react';
import { MenuCategory } from '../data/mock-menu';
import Image from 'next/image';

interface PageProps {
    categories: MenuCategory[];
    activeCategoryId: string;
    onCategoryClick: (catId: string) => void;
}

export const LeftPage = ({ categories, activeCategoryId, onCategoryClick }: PageProps) => {
    // Current category details for display
    const currentCat = categories.find(c => c.id === activeCategoryId);

    return (
        <div className="w-full h-full relative flex flex-col font-serif overflow-hidden">
            {/* Ornate Frame Background */}
            <div
                className="absolute inset-0 bg-contain bg-center bg-no-repeat z-0"
                style={{ backgroundImage: 'url(/images/menu-listing/ornate-frame.png)' }}
            />

            {/* MAIN CONTENT AREA ON LEFT PAGE - DECORATIVE */}
            <div className="absolute inset-0 p-[8%] sm:p-[9%] md:p-[10%] flex flex-col items-center justify-center text-center z-10 pointer-events-none">
                <div className="border-[2px] md:border-[3px] border-[#C5A059]/30 p-1.5 md:p-2 rounded-full mb-[4%] animate-in zoom-in duration-700">
                    <div className="w-[70px] h-[70px] sm:w-[90px] sm:h-[90px] md:w-[110px] md:h-[110px] lg:w-[130px] lg:h-[130px] xl:w-[150px] xl:h-[150px] rounded-full overflow-hidden grayscale opacity-80">
                        {/* Decorative Image - Dynamic based on cat? Or static */}
                        <Image width={1920} height={1080} src="/images/menu-listing/menu-grid/layer1.png" className="w-full h-full object-cover" alt="Decor" />
                    </div>
                </div>

                <h3 className="text-[#C5A059] font-display text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl uppercase tracking-[0.2em] md:tracking-[0.3em] mb-2 md:mb-3">
                    {currentCat?.name || 'Au Lac'}
                </h3>
                <p className="text-[#E5D9B6]/60 font-serif italic text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs xl:text-sm leading-relaxed max-w-[95%] md:max-w-[90%]">
                    &quot;Experience the authentic taste of Vietnam, where every dish tells a story of tradition and flavor.&quot;
                </p>
                <div className="w-8 sm:w-10 md:w-12 lg:w-16 h-px bg-[#C5A059]/40 mt-2 sm:mt-3 md:mt-4"></div>
            </div>

        </div>
    );
};
