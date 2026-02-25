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
            {/* 1. Ornate Frame Background */}
            <div
                className="absolute inset-0 bg-contain bg-center bg-no-repeat z-0 drop-shadow-2xl"
                style={{ backgroundImage: 'url(/images/menu-listing/layer2B.2.1.png)' }}
            />

            {/* 2. LỚP PHỦ CHỐNG CHÓI (Anti-glare overlay) - Cực mỏng để làm dịu mắt trên màn hình to */}
            <div className="absolute inset-0 bg-black/[0.03] pointer-events-none z-0 mix-blend-overlay"></div>

            {/* MAIN CONTENT AREA ON LEFT PAGE - DECORATIVE */}
            <div className="absolute inset-0 p-[8%] sm:p-[9%] md:p-[10%] flex flex-col items-center justify-center text-center z-10 pointer-events-none">

                {/* Viền ảnh: Đổi sang màu Vàng Đồng Đậm */}
                <div className="border-[2px] md:border-[3px] border-[#9A7B4F]/40 p-1.5 md:p-2 rounded-full mb-[4%] animate-in zoom-in duration-700 shadow-sm">
                    {/* Ảnh trang trí: Thêm mix-blend-multiply để ảnh quyện vào vân giấy mộc mạc hơn */}
                    <div className="w-[70px] h-[70px] sm:w-[90px] sm:h-[90px] md:w-[110px] md:h-[110px] lg:w-[130px] lg:h-[130px] xl:w-[150px] xl:h-[150px] rounded-full overflow-hidden grayscale opacity-85 mix-blend-multiply">
                        {/* Decorative Image - Dynamic based on cat? Or static */}
                        <Image width={1920} height={1080} src="/images/menu-listing/menu-grid/layer1.png" className="w-full h-full object-cover" alt="Decor" />
                    </div>
                </div>

                {/* Tiêu đề Category: Chuyển sang Vàng Đồng Đậm + drop-shadow nhẹ để nảy bật lên */}
                <h3 className="text-[#9A7B4F] font-display text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl uppercase tracking-[0.2em] md:tracking-[0.3em] mb-2 md:mb-3 font-bold drop-shadow-sm">
                    {currentCat?.name || 'Au Lac'}
                </h3>

                {/* Trích dẫn (Quote): Chuyển sang màu Xanh Navy tối (Dark Navy) để dễ đọc trên nền sáng */}
                <p className="text-[#0f172a]/80 font-serif italic text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs xl:text-sm leading-relaxed max-w-[95%] md:max-w-[90%] font-medium">
                    &quot;Experience the authentic taste of Vietnam, where every dish tells a story of tradition and flavor.&quot;
                </p>

                {/* Đường gạch ngang: Đổi sang Vàng Đồng Đậm */}
                <div className="w-8 sm:w-10 md:w-12 lg:w-16 h-[1.5px] bg-[#9A7B4F]/50 mt-2 sm:mt-3 md:mt-4"></div>
            </div>

        </div>
    );
};