import React from 'react';
import { MenuCategory } from '../data/mock-menu';

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
            {/* CSS-Only Paper Background - Dark Theme */}
            <div className="absolute inset-0 bg-[#0B252E] z-0">
                {/* Texture Noise */}
                <div className="absolute inset-0 opacity-[0.1]"
                    style={{ backgroundImage: 'radial-gradient(#C5A059 1px, transparent 1px)', backgroundSize: '4px 4px' }}
                />

                {/* Spine Shadow Gradient (Left Side) - Darker near the spine */}
                <div className="absolute right-0 top-0 bottom-0 w-[40px] bg-gradient-to-l from-black/10 to-transparent pointer-events-none" />

                {/* Page Edge Highlight (Left) */}
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-white/20 pointer-events-none" />
            </div>

            {/* Overlay for texture */}
            <div className="absolute inset-0 bg-[#0f172a]/20 z-0"></div>

            {/* MAIN CONTENT AREA ON LEFT PAGE - DECORATIVE */}
            <div className="absolute inset-0 p-[10%] flex flex-col items-center justify-center text-center z-10 pointer-events-none">
                <div className="border-[2px] md:border-[4px] border-[#C5A059]/30 p-1.5 md:p-2 rounded-full mb-[5%] animate-in zoom-in duration-700">
                    <div className="w-[100px] h-[100px] md:w-[120px] md:h-[120px] lg:w-[140px] lg:h-[140px] rounded-full overflow-hidden grayscale opacity-80">
                        {/* Decorative Image - Dynamic based on cat? Or static */}
                        <img src="/images/menu-listing/menu-grid/layer1.png" className="w-full h-full object-cover" alt="Decor" />
                    </div>
                </div>

                <h3 className="text-[#C5A059] font-display text-base md:text-lg lg:text-xl uppercase tracking-[0.2em] md:tracking-[0.3em] mb-2 md:mb-4">
                    {currentCat?.name || 'Au Lac'}
                </h3>
                <p className="text-[#E5D9B6]/60 font-serif italic text-[10px] md:text-xs lg:text-sm leading-relaxed max-w-[95%] md:max-w-[90%]">
                    "Experience the authentic taste of Vietnam, where every dish tells a story of tradition and flavor."
                </p>
                <div className="w-12 md:w-16 h-[1px] bg-[#C5A059]/40 mt-4 md:mt-6"></div>
            </div>

        </div>
    );
};
