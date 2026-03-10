"use client";

import React from 'react';
import { MenuCategory } from '../data/mock-menu';
import { useParams } from 'next/navigation';

// =====================================================================
// 1. INTERFACE CHUẨN KHỚP VỚI API JSON CỦA BẠN
// =====================================================================
export interface I18nTextDto {
    vi?: string; Vi?: string;
    en?: string; En?: string;
    fr?: string; Fr?: string;
}

export interface TagI18nDto {
    valueId?: number;
    valueCode: string;
    valueName?: string;
    description?: string;
    i18n?: I18nTextDto;
    descriptionI18n?: I18nTextDto;
}

interface PageProps {
    categories: MenuCategory[];
    activeCategoryId: string;
    tags?: TagI18nDto[]; // Nhận trực tiếp data từ component cha
}

// =====================================================================
// 2. MAPPING CATEGORY ID -> TAG NGUYÊN TỐ
// =====================================================================
const CATEGORY_TO_TAG_MAP: Record<string, string> = {
    '2': 'TAG_EARTH',   // Starters
    '3': 'TAG_WATER',   // Salads
    '4': 'TAG_WATER',   // Phở
    '5': 'TAG_WOOD',    // Rice Vermicelli
    '6': 'TAG_FIRE',    // Signature Dishes
    '7': 'TAG_EARTH',   // Coffee & Tea
    '8': 'TAG_METAL',   // Desserts
    '9': 'TAG_METAL',   // Mignardises
    '10': 'TAG_WATER',  // Beverages
};

// =====================================================================
// 3. TỪ ĐIỂN DỰ PHÒNG & TÊN CỐ ĐỊNH CHO GÁY SÁCH
// =====================================================================
const DICT: Record<string, any> = {
    'TAG_EARTH': {
        chapter: 'Chapter I',
        name: { vi: 'THỔ', en: 'EARTH', fr: 'TERRE' },
        desc: { vi: "Nơi bao cành xanh sinh ra...", en: "Opening dishes, awaken the palate...", fr: "Plats d’ouverture..." }
    },
    'TAG_WATER': {
        chapter: 'Chapter II',
        name: { vi: 'THỦY', en: 'WATER', fr: 'EAU' },
        desc: { vi: "Sông xanh êm trôi...", en: "Light and fresh dishes...", fr: "Plats légers et frais..." }
    },
    'TAG_WOOD': {
        chapter: 'Chapter III',
        name: { vi: 'MỘC', en: 'WOOD', fr: 'BOIS' },
        desc: { vi: "Cây cao vươn lên...", en: "Warm and hearty dishes...", fr: "Plats chauds et copieux..." }
    },
    'TAG_FIRE': {
        chapter: 'Chapter IV',
        name: { vi: 'HỎA', en: 'FIRE', fr: 'FEU' },
        desc: { vi: "Sáng soi đêm thâu...", en: "Hot, flavorful dishes...", fr: "Plats chauds et savoureux..." }
    },
    'TAG_METAL': {
        chapter: 'Chapter V',
        name: { vi: 'KIM', en: 'METAL', fr: 'MÉTAL' },
        desc: { vi: "Thanh âm ngân nga...", en: "Final dishes, gentle...", fr: "Plats finaux, doux..." }
    }
};

export const LeftPage = ({ categories, activeCategoryId, tags = [] }: PageProps) => {
    const params = useParams();
    const currentLocale = (params?.locale as 'vi' | 'en' | 'fr') || 'fr';
    const currentCat = categories.find(c => c.id.toString() === activeCategoryId?.toString());

    // Xác định Tag Code
    const getTagCode = (): string => {
        const id = activeCategoryId?.toString().toLowerCase() || '';
        const name = (currentCat?.name || '').toLowerCase();
        if (CATEGORY_TO_TAG_MAP[id]) return CATEGORY_TO_TAG_MAP[id];
        if (name.includes('starter') || name.includes('khai vị') || name.includes('entrée')) return 'TAG_EARTH';
        if (name.includes('salad') || name.includes('gỏi')) return 'TAG_WATER';
        if (name.includes('phở') || name.includes('pho')) return 'TAG_WATER';
        if (name.includes('vermicelli') || name.includes('bún')) return 'TAG_WOOD';
        if (id.includes('signature') || name.includes('signature') || name.includes('đặc trưng')) return 'TAG_FIRE';
        if (name.includes('coffee') || name.includes('tea') || name.includes('café') || name.includes('trà') || name.includes('cà phê')) return 'TAG_EARTH';
        if (name.includes('dessert') || name.includes('tráng miệng')) return 'TAG_METAL';
        if (name.includes('mignardise') || name.includes('bánh mứt')) return 'TAG_METAL';
        if (name.includes('beverage') || name.includes('boisson') || name.includes('thức uống') || name.includes('drink')) return 'TAG_WATER';
        return 'TAG_WATER';
    };

    const tagCode = getTagCode();
    // Lấy Tag trực tiếp từ props truyền vào
    const apiTag = tags.find(t => t.valueCode === tagCode);
    const fallback = DICT[tagCode] || DICT['TAG_WATER'];

    const extract = (i18nObj?: I18nTextDto, loc: string = 'en'): string | null => {
        if (!i18nObj) return null;
        const lowerVal = i18nObj[loc.toLowerCase() as keyof I18nTextDto];
        if (lowerVal && lowerVal.trim() !== '') return lowerVal;
        const pascalLocale = (loc.charAt(0).toUpperCase() + loc.slice(1).toLowerCase()) as keyof I18nTextDto;
        const pascalVal = i18nObj[pascalLocale];
        if (pascalVal && pascalVal.trim() !== '') return pascalVal;
        return null;
    };

    const spineNameVi = fallback.name.vi;
    const spineNameEn = fallback.name.en;
    const spineNameFr = fallback.name.fr;

    // Tiêu đề giữa trang: Lấy từ API, nếu chưa có API lấy fallback
    const displayTagName = extract(apiTag?.i18n, currentLocale) || fallback.name[currentLocale];

    // Xử lý Description từ DB
    let rawStory = extract(apiTag?.descriptionI18n, currentLocale) || fallback.desc[currentLocale];

    // Bóc tách ngôn ngữ từ chuỗi nối của Database "(V) | (E) | (F)"
    if (rawStory.includes('|')) {
        const parts = rawStory.split('|').map((s: string) => s.trim());
        if (currentLocale === 'vi' && parts[0]) rawStory = parts[0];
        else if (currentLocale === 'en' && parts[1]) rawStory = parts[1];
        else if (currentLocale === 'fr' && parts[2]) rawStory = parts[2];
        else rawStory = parts[0];
    }

    // Xóa ngoặc đơn () bọc ngoài
    rawStory = rawStory.replace(/^\(|\)$/g, '').trim();

    // Tách thành mảng để render thành thơ
    let storyArray = rawStory.split('\n').filter((line: string) => line.trim() !== '');
    if (storyArray.length === 1 && storyArray[0].includes(',')) {
        storyArray = storyArray[0].split(',').map((part: string, index: number, arr: string[]) => {
            const trimmed = part.trim();
            if (index === arr.length - 1) return trimmed;
            return trimmed + ',';
        });
    }

    const Filigree = ({ className }: { className?: string }) => (
        <div className={`absolute text-[#C5A059] opacity-40 ${className}`}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-[10%] h-auto max-w-[40px] max-h-[40px]">
                <path d="M4 4v4a2 2 0 0 0 2 2h4" />
                <path d="M4 4h4a2 2 0 0 1 2 2v4" />
                <circle cx="6" cy="6" r="1" fill="currentColor" />
                <path d="M10 10l-4-4" />
            </svg>
        </div>
    );

    return (
        <div className="w-full h-full relative flex font-serif overflow-hidden bg-[#FDFBF7]">
            <div
                className="absolute inset-0 bg-contain bg-center bg-no-repeat z-0 opacity-70"
                style={{ backgroundImage: 'url(/images/menu-listing/layer2B.2.1.png)' }}
            />

            {/* DẢI GÁY SÁCH - Chữ ngắn, bao nét, hết nhòe */}
            <div className="w-[12%] md:w-[15%] h-full bg-[#0f172a] shadow-[4px_0_15px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center pt-[30%] md:pt-[35%] z-20 relative border-r border-[#C5A059]/20 shrink-0">
                <h2 className="text-[#C5A059] font-display font-bold uppercase whitespace-nowrap -rotate-90 text-[14px] md:text-[16px] lg:text-[18px] tracking-[0.2em] flex items-center gap-[10%] md:gap-[15%]" style={{ WebkitFontSmoothing: 'antialiased' }}>
                    <span>{spineNameVi}</span>
                    <span className="text-[#C5A059]/40 text-[9px]">♦</span>
                    <span>{spineNameEn}</span>
                    <span className="text-[#C5A059]/40 text-[9px]">♦</span>
                    <span>{spineNameFr}</span>
                </h2>
                <div className="absolute right-[5%] md:right-[10%] top-[10%] bottom-[10%] w-[1px] bg-[#C5A059]/20"></div>
            </div>

            <div className="flex-1 absolute inset-0 left-[12%] md:left-[15%] px-[6%] md:px-[8%] py-[6%] md:py-[8%] flex flex-col items-center justify-center z-10 text-center">

                <Filigree className="top-[6%] left-[6%] md:top-[8%] md:left-[8%]" />
                <Filigree className="top-[6%] right-[6%] md:top-[8%] md:right-[8%] scale-x-[-1]" />
                <Filigree className="bottom-[6%] left-[6%] md:bottom-[8%] md:left-[8%] scale-y-[-1]" />
                <Filigree className="bottom-[6%] right-[6%] md:bottom-[8%] md:right-[8%] scale-[-1]" />

                <div className="flex flex-col items-center justify-center w-full mt-[4%] md:mt-[6%]">

                    <h1 className="text-[#0f172a] text-[28px] md:text-[34px] lg:text-[36px] font-display font-medium leading-none uppercase tracking-[0.15em] drop-shadow-sm mb-[4%]">
                        {displayTagName}
                    </h1>

                    <h2 className="text-[#C5A059] text-[14px] md:text-[16px] lg:text-[18px] font-display font-bold uppercase tracking-[0.25em] mb-[8%] md:mb-[10%]">
                        {currentCat?.name || 'MENU'}
                    </h2>

                    <div className="relative w-[40%] max-w-[140px] h-[1px] bg-[#8A8175]/40 mb-[8%] md:mb-[10%] flex justify-center items-center">
                        <div className="absolute bg-[#FDFBF7] px-2 md:px-3">
                            <div className="w-[5px] h-[5px] md:w-2 md:h-2 bg-[#8A8175] transform rotate-45"></div>
                        </div>
                    </div>

                    <div className="w-[90%] max-w-[420px] flex flex-col gap-6 md:gap-8">
                        {storyArray.map((p: string, i: number) => (
                            <p key={i} className="text-[#0f172a]/90 font-serif italic text-[15px] md:text-[18px] lg:text-[20px] leading-relaxed tracking-normal">
                                {p}
                            </p>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};