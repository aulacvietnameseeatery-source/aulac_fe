"use client";

import React from 'react';
import { MenuCategory } from '../data/mock-menu';
import { useParams } from 'next/navigation';

interface PageProps {
    categories: MenuCategory[];
    activeCategoryId: string;
}

// BỘ TỪ ĐIỂN ĐÃ ĐƯỢC TINH CHỌN TỪ NGỮ 100% KHÔNG LỖI FONT
const ELEMENT_DICT: Record<string, any> = {
    'TAG_EARTH': {
        chapter: 'Chapter I',
        name: { vi: 'THỔ', en: 'EARTH', fr: 'TERRE' },
        subtitle: 'The Foundation of Life',
        story: {
            vi: [
                "Nơi bao cành xanh sinh ra,",
                "Mang cho ta no say.",
                "Tôn vinh bao nét duyên,",
                "Trao tay hương thanh tao."
            ],
            en: [
                "Opening dishes, awaken the palate,",
                "symbolizing the foundation and stability of Earth."
            ],
            fr: [
                "Plats d’ouverture, éveillent le palais,",
                "symbolisant la base et la stabilité de la Terre."
            ]
        }
    },
    'TAG_WATER': {
        chapter: 'Chapter II',
        name: { vi: 'THỦY', en: 'WATER', fr: 'EAU' },
        subtitle: 'The Flow of Purity',
        story: {
            vi: [
                "Sông xanh êm trôi,",
                "Trong veo xua chua cay.",
                "Thanh thanh như mây bay,",
                "Trao bao an vui say."
            ],
            en: [
                "Light and fresh dishes, balancing the body,",
                "symbolizing the flow and nurturing of Water."
            ],
            fr: [
                "Plats légers et frais, équilibrant le corps,",
                "symbolisant le flux et la vitalité de l’Eau."
            ]
        }
    },
    'TAG_WOOD': {
        chapter: 'Chapter III',
        name: { vi: 'MỘC', en: 'WOOD', fr: 'BOIS' },
        subtitle: 'The Spirit of Growth',
        story: {
            vi: [
                "Cây cao vươn lên,",
                "Xanh tươi mang say mê.",
                "Hương bay xua lo âu,",
                "Tôn vinh bao công lao."
            ],
            en: [
                "Warm and hearty dishes,",
                "symbolizing growth and vitality of Wood."
            ],
            fr: [
                "Plats chauds et copieux,",
                "symbolisant la croissance et la vitalité du Bois."
            ]
        }
    },
    'TAG_FIRE': {
        chapter: 'Chapter IV',
        name: { vi: 'HỎA', en: 'FIRE', fr: 'FEU' },
        subtitle: 'The Hearth and the Flame',
        story: {
            vi: [
                "Sáng soi đêm thâu,",
                "Nung hương bay bay cao.",
                "Khơi lên bao đam mê,",
                "Cho ta say sưa thêm."
            ],
            en: [
                "Hot, flavorful dishes,",
                "radiating energy and warmth of Fire."
            ],
            fr: [
                "Plats chauds et savoureux,",
                "diffusant énergie et chaleur du Feu."
            ]
        }
    },
    'TAG_METAL': {
        chapter: 'Chapter V',
        name: { vi: 'KIM', en: 'METAL', fr: 'MÉTAL' },
        subtitle: 'The Refined Resonance',
        story: {
            vi: [
                "Thanh âm ngân nga,",
                "Trao tinh hoa cho nhau.",
                "Êm êm trôi qua mau,",
                "Nơi nay an vui lâu."
            ],
            en: [
                "Final dishes, gentle, symbolizing",
                "refinement, resonance, and completion."
            ],
            fr: [
                "Plats finaux, doux, symbolisant la finesse,",
                "la résonance et la conclusion complète."
            ]
        }
    }
};

export const LeftPage = ({ categories, activeCategoryId }: PageProps) => {
    const params = useParams();
    const currentLocale = (params?.locale as string) || 'fr';
    const currentCat = categories.find(c => c.id === activeCategoryId);

    let tagCode = 'TAG_WATER';
    if (activeCategoryId === 'cat_starters') tagCode = 'TAG_EARTH';
    if (activeCategoryId === 'cat_mains') tagCode = 'TAG_WOOD';
    if (activeCategoryId === 'cat_desserts') tagCode = 'TAG_METAL';
    if (activeCategoryId === 'cat_beverages') tagCode = 'TAG_WATER';

    const info = ELEMENT_DICT[tagCode];
    // Lấy Story theo ngôn ngữ hiện tại
    const currentStory = info.story[currentLocale] || info.story.en;

    // Họa tiết Filigree góc
    const Filigree = ({ className }: { className?: string }) => (
        <div className={`absolute text-[#C5A059] opacity-40 ${className}`}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M4 4v4a2 2 0 0 0 2 2h4" />
                <path d="M4 4h4a2 2 0 0 1 2 2v4" />
                <circle cx="6" cy="6" r="1" fill="currentColor" />
                <path d="M10 10l-4-4" />
            </svg>
        </div>
    );

    return (
        <div className="w-full h-full relative flex font-serif overflow-hidden bg-[#FDFBF7]">
            {/* Background giống RightPage */}
            <div
                className="absolute inset-0 bg-contain bg-center bg-no-repeat z-0 opacity-70"
                style={{ backgroundImage: 'url(/images/menu-listing/layer2B.2.1.png)' }}
            />

            {/* Dải gáy sách 3 ngôn ngữ */}
            <div className="w-[12%] md:w-[15%] h-full bg-[#0f172a] shadow-[4px_0_15px_rgba(0,0,0,0.15)] flex items-center justify-center z-20 relative border-r border-[#C5A059]/20 shrink-0">
                <h2 className="text-[#C5A059] font-display font-bold uppercase whitespace-nowrap -rotate-90 text-[15px] md:text-[17px] lg:text-[19px] tracking-[0.2em] flex items-center gap-6">
                    <span>{info.name.vi}</span>
                    <span className="text-[#C5A059]/40 text-[10px]">♦</span>
                    <span>{info.name.en}</span>
                    <span className="text-[#C5A059]/40 text-[10px]">♦</span>
                    <span>{info.name.fr}</span>
                </h2>
                <div className="absolute right-1.5 md:right-2 top-[10%] bottom-[10%] w-[1px] bg-[#C5A059]/20"></div>
            </div>

            {/* Nội dung chính - Đẩy xuống 20px bằng mt-6 */}
            <div className="flex-1 relative flex flex-col justify-center items-center px-12 md:px-20 z-10 text-center mt-6">

                {/* Góc Họa Tiết */}
                <Filigree className="top-8 left-10" />
                <Filigree className="top-8 right-10 scale-x-[-1]" />
                <Filigree className="bottom-12 left-10 scale-y-[-1]" />
                <Filigree className="bottom-12 right-10 scale-[-1]" />

                {/* Tiêu đề Nguyên tố */}
                <h1 className="text-[#0f172a] text-5xl md:text-6xl lg:text-[72px] font-display font-bold leading-none mb-3 uppercase tracking-wide">
                    {info.name[currentLocale]}
                </h1>

                {/* Tiêu đề Category - Mới Thêm Vào */}
                <h2 className="text-[#C5A059] text-base md:text-lg lg:text-xl font-display font-bold uppercase tracking-[0.2em] mb-4">
                    {currentCat?.name || 'MENU'}
                </h2>

                {/* Subtitle */}
                <h3 className="text-[#C5A059] text-xl md:text-2xl font-serif italic mb-8">
                    {info.subtitle}
                </h3>

                {/* Divider */}
                <div className="relative w-[120px] h-[1px] bg-[#8A8175]/30 mb-8 flex justify-center items-center">
                    <div className="absolute bg-[#FDFBF7] px-3">
                        <div className="w-2 h-2 bg-[#8A8175] transform rotate-45"></div>
                    </div>
                </div>

                <div className="max-w-[380px] space-y-3">
                    {currentStory.map((p: string, i: number) => (
                        <p key={i} className="text-[#0f172a]/90 font-serif italic text-[16px] md:text-[18px] leading-[1.8] tracking-normal">
                            {p}
                        </p>
                    ))}
                </div>

                <div className="mt-14 opacity-30 tracking-[0.4em] text-[10px] uppercase font-bold text-[#0f172a] font-display">
                    AN LẠC
                </div>
            </div>
        </div>
    );
};