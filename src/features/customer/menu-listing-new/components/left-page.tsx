"use client";

import React from 'react';
import { MenuCategory } from '../data/mock-menu';
import { useParams } from 'next/navigation'; // THÊM IMPORT NÀY

interface PageProps {
    categories: MenuCategory[];
    activeCategoryId: string;
    onCategoryClick: (catId: string) => void;
}

// BỘ TỪ ĐIỂN MAP VỚI MÃ TRONG DATABASE (LookupValues)
const ELEMENT_DICT: Record<string, any> = {
    'TAG_EARTH': {
        name: { vi: 'THỔ', en: 'EARTH', fr: 'TERRE' },
        story: {
            vi: 'Món mở màn, đánh thức vị giác, tượng trưng cho nền tảng, sự ổn định của Thổ.',
            en: 'Opening dishes, awaken the palate, symbolizing the foundation and stability of Earth.',
            fr: 'Plats d’ouverture, éveillent le palais, symbolisant la base et la stabilité de la Terre.'
        }
    },
    'TAG_WATER': {
        name: { vi: 'THỦY', en: 'WATER', fr: 'EAU' },
        story: {
            vi: 'Món nhẹ, tươi mát, cân bằng cơ thể, tượng trưng cho dòng chảy, sự nuôi dưỡng của Thủy.',
            en: 'Light and fresh dishes, balancing the body, symbolizing the flow and nurturing of Water.',
            fr: 'Plats légers et frais, équilibrant le corps, symbolisant le flux et la vitalité de l’Eau.'
        }
    },
    'TAG_WOOD': {
        name: { vi: 'MỘC', en: 'WOOD', fr: 'BOIS' },
        story: {
            vi: 'Món ấm, đầy đặn, tượng trưng cho sự sinh trưởng, năng lượng của Mộc.',
            en: 'Warm and hearty dishes, symbolizing growth and vitality of Wood.',
            fr: 'Plats chauds et copieux, symbolisant la croissance et la vitalité du Bois.'
        }
    },
    'TAG_FIRE': {
        name: { vi: 'HỎA', en: 'FIRE', fr: 'FEU' },
        story: {
            vi: 'Món nóng, hương vị đậm đà, lan tỏa năng lượng và sự ấm áp của Hỏa.',
            en: 'Hot, flavorful dishes, radiating energy and warmth of Fire.',
            fr: 'Plats chauds et savoureux, diffusant énergie et chaleur du Feu.'
        }
    },
    'TAG_METAL': {
        name: { vi: 'KIM', en: 'METAL', fr: 'MÉTAL' },
        story: {
            vi: 'Món nhẹ, tạo chuyển tiếp, nuôi dưỡng vị giác cuối bữa.',
            en: 'Light dishes creating transition, nourishing the palate at the end.',
            fr: 'Plats légers créant une transition, nourrissant le palais à la fin.'
        }
    }
};

export const LeftPage = ({ categories, activeCategoryId, onCategoryClick }: PageProps) => {
    // 1. LẤY NGÔN NGỮ HIỆN TẠI
    const params = useParams();
    const currentLocale = (params?.locale as string) || 'fr'; // fr, en, hoặc vi

    const currentCat = categories.find(c => c.id === activeCategoryId);

    // 2. MAPPING LOGIC (Thay thế bằng data thật từ Backend sau này)
    // Ví dụ: const tagCode = currentCat.elementTag || 'TAG_WATER';
    let tagCode = 'TAG_WATER';
    if (activeCategoryId === 'cat-1') tagCode = 'TAG_EARTH';
    if (activeCategoryId === 'cat-3') tagCode = 'TAG_WOOD';

    const elementInfo = ELEMENT_DICT[tagCode];

    // Lấy nội dung theo đúng ngôn ngữ đang chọn
    const elementName = elementInfo.name[currentLocale];
    const elementStory = elementInfo.story[currentLocale];

    return (
        <div className="w-full h-full relative flex font-serif overflow-hidden bg-[#FDFBF7]">
            <div
                className="absolute inset-0 bg-contain bg-center bg-no-repeat z-0 opacity-70"
                style={{ backgroundImage: 'url(/images/menu-listing/layer2B.2.1.png)' }}
            />

            {/* THẺ NGUYÊN TỐ DỌC */}
            <div className="w-[12%] md:w-[15%] h-full bg-[#0f172a] shadow-[4px_0_15px_rgba(0,0,0,0.15)] flex items-center justify-center z-20 relative border-r border-[#C5A059]/20 shrink-0">
                {/* Tên Nguyên Tố Tự Động Đổi Theo Ngôn Ngữ */}
                <h2 className="text-[#C5A059] font-display font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] whitespace-nowrap -rotate-90 text-sm md:text-lg lg:text-xl">
                    {elementName} - {currentCat?.name || 'AN LAC'}
                </h2>
                <div className="absolute right-1.5 md:right-2 top-[10%] bottom-[10%] w-[1px] bg-[#C5A059]/20"></div>
            </div>

            {/* NỘI DUNG STORY */}
            <div className="flex-1 h-full flex flex-col justify-center px-[6%] md:px-[10%] z-10 relative">
                {/* Chữ Watermark mờ */}
                <div className="absolute top-[10%] right-[10%] text-[#0f172a] opacity-[0.03] text-[150px] md:text-[200px] font-display font-bold leading-none pointer-events-none select-none">
                    {elementName.charAt(0)}
                </div>

                {/* Tiêu đề cố định (Tùy bạn muốn dịch hay không) */}
                <h3 className="text-[#0f172a] text-lg md:text-2xl lg:text-3xl font-serif uppercase tracking-widest mb-1 md:mb-2 font-bold leading-tight drop-shadow-sm">
                    {currentLocale === 'vi' ? 'TINH HOA' : (currentLocale === 'fr' ? 'L’ESSENCE' : 'ESSENCE OF')} <br />
                    <span className="text-[#C5A059]">{currentCat?.name || 'MENU'}</span>
                </h3>

                <div className="w-12 md:w-16 h-[2px] bg-[#C5A059] mb-4 md:mb-6 shadow-sm"></div>

                {/* Story Tự Động Thay Đổi */}
                <div className="flex flex-col gap-2 md:gap-3">
                    <p className="text-[#0f172a]/90 font-serif italic text-[11px] md:text-sm lg:text-base leading-relaxed font-semibold">
                        "{elementStory}"
                    </p>
                </div>
            </div>
        </div>
    );
};