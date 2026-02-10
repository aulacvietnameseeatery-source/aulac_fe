import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useIsMobile } from '@/hooks/header/useIsMobile';
import HTMLFlipBook from 'react-pageflip';
import { MENU_DATA, MenuCategory, MenuItemData } from '../data/mock-menu';
import { LeftPage } from './left-page';
import { RightPage } from './right-page';
import { ItemDetailModal } from './item-detail-modal';
import { MenuItem } from './menu-card'; // For type compatibility

// Page Component Wrapper
const Page = React.forwardRef<HTMLDivElement, { children: React.ReactNode, number?: number, className?: string }>((props, ref) => {
    return (
        <div className={`demoPage bg-[#0f172a] h-full ${props.className} overflow-hidden`} ref={ref}>
            <div className="h-full w-full relative">
                {props.children}
            </div>
        </div>
    );
});
Page.displayName = 'Page';

// STYLES FOR TABS
const BOOKMARK_STYLES = [
    'bg-[#1e293b] border-[#C5A059]/40 text-[#C5A059]',
    'bg-[#0f172a] border-[#C5A059]/40 text-[#C5A059]',
    'bg-[#3f2e18] border-[#E5D9B6]/40 text-[#E5D9B6]',
    'bg-[#1a1510] border-[#C5A059]/40 text-[#C5A059]',
];

export const BookFrame = ({ onAddToCart }: { onAddToCart?: (item: MenuItemData) => void }) => {
    // 1. STATE
    const bookRef = useRef<any>(null);
    const [bookDimensions, setBookDimensions] = useState({ width: 0, height: 0 });
    const paperWrapperRef = useRef<HTMLDivElement>(null);
    const [selectedItem, setSelectedItem] = useState<MenuItemData | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isMobile, setIsMobile] = useState(false);

    // 2. GENERATE PAGES LOGIC
    const ITEMS_PER_PAGE = 6;

    interface PageConfig {
        type: 'content';
        category: MenuCategory;
        items: MenuItemData[];
        pageIndex: number;
    }

    // Resize Logic
    useEffect(() => {
        let resizeTimeout: NodeJS.Timeout;
        
        const updateSize = () => {
            if (paperWrapperRef.current) {
                const width = paperWrapperRef.current.offsetWidth;
                const height = paperWrapperRef.current.offsetHeight;
                const mobile = window.innerWidth < 1024; // Mobile/Tablet Breakpoint
                
                setIsMobile(mobile);

                // If mobile, page width = container width. If desktop, page width = container width / 2.
                setBookDimensions({
                    width: mobile ? width : width / 2,
                    height: height
                });
            }
        };
        
        const debouncedUpdate = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(updateSize, 100);
        };
        
        // Initial size
        updateSize();
        
        // ResizeObserver for container changes
        const observer = new ResizeObserver(() => {
            debouncedUpdate();
        });
        
        // Window resize listener for responsive breakpoint changes
        const handleWindowResize = () => {
            debouncedUpdate();
        };
        
        window.addEventListener('resize', handleWindowResize);
        
        if (paperWrapperRef.current) {
            observer.observe(paperWrapperRef.current);
        }
        
        return () => {
            clearTimeout(resizeTimeout);
            observer.disconnect();
            window.removeEventListener('resize', handleWindowResize);
        };
    }, []);

    const { spreads, categoryStartIndices, pageToCategoryMap } = useMemo(() => {
        const spreadList: PageConfig[] = [];
        const catIndices: Record<string, number> = {};
        const pageToCat: Record<number, string> = {};

        let currentPageIndex = 1;

        MENU_DATA.forEach(cat => {
            const chunks = [];
            for (let i = 0; i < cat.items.length; i += ITEMS_PER_PAGE) {
                chunks.push(cat.items.slice(i, i + ITEMS_PER_PAGE));
            }
            if (chunks.length === 0) chunks.push([]);

            catIndices[cat.id] = currentPageIndex;

            chunks.forEach(chunk => {
                spreadList.push({
                    type: 'content',
                    category: cat,
                    items: chunk,
                    pageIndex: currentPageIndex
                });

                if (isMobile) {
                    // Mobile: Single Page (Items only)
                    pageToCat[currentPageIndex] = cat.id;
                    currentPageIndex += 1;
                } else {
                    // Desktop: Double Page (Info Left + Items Right)
                    pageToCat[currentPageIndex] = cat.id;
                    pageToCat[currentPageIndex + 1] = cat.id;
                    currentPageIndex += 2;
                }
            });
        });

        return { spreads: spreadList, categoryStartIndices: catIndices, pageToCategoryMap: pageToCat };
    }, [isMobile]);

    // 3. ACTIONS
    const handleCategoryClick = (catId: string) => {
        const targetIndex = categoryStartIndices[catId];
        if (targetIndex !== undefined && bookRef.current) {
            bookRef.current.pageFlip().flip(targetIndex);
        }
    };

    const handleNext = () => bookRef.current?.pageFlip().flipNext();
    const handlePrev = () => {
        if (currentPage > 1) {
            bookRef.current?.pageFlip().flipPrev();
        }
    };

    // Derived Active Category
    const activeCategoryId = pageToCategoryMap[currentPage] || (currentPage > 0 ? Object.values(pageToCategoryMap).pop() : null);

    const isReady = bookDimensions.width > 0 && bookDimensions.height > 0;

    // Force open to page 1 (Content) if it starts at 0 and handle mobile/desktop switch
    useEffect(() => {
        if (isReady && bookRef.current) {
            const timer = setTimeout(() => {
                try {
                    const flip = bookRef.current.pageFlip();
                    if (flip) {
                        const currentIndex = flip.getCurrentPageIndex();
                        // Reset to page 1 when switching layouts or if at page 0
                        if (currentIndex === 0) {
                            flip.turnToPage(1);
                        }
                    }
                } catch (e) {
                    console.error("Flip error", e);
                }
            }, 150);
            return () => clearTimeout(timer);
        }
    }, [isReady, isMobile]);

    return (
        <div
            className={`relative w-full mx-auto z-10 shadow-2xl transition-all duration-500 font-serif perspective-[2000px] ${isMobile ? 'pl-0 mt-12 mb-4' : 'pl-[100px]'}`}
            style={{
                maxWidth: isMobile ? '100%' : 'min(1400px, calc((100vh - 140px) * (3 / 2)))',
                width: '100%'
            }}
        >

            {/* Detail Modal */}
            {selectedItem && (
                <ItemDetailModal
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    onAddToCart={(item) => {
                        onAddToCart?.(item);
                    }}
                />
            )}

            {/* CATEGORY FILTER (Responsive) */}
            {isMobile ? (
                // MOBILE: COMPACT DROPDOWN
                <div className="absolute -top-[50px] left-0 right-0 z-50 flex justify-center px-4">
                    <div className="relative w-full max-w-[200px]">
                        <button
                            onClick={() => {
                                // Toggle dropdown (simple implementation using state approach in parent would be better, but self-contained here for now)
                                const menu = document.getElementById('mobile-cat-menu');
                                if (menu) menu.classList.toggle('hidden');
                            }}
                            className="w-full bg-[#0f172a] text-[#C5A059] border border-[#C5A059] px-4 py-2 rounded-sm shadow-lg flex items-center justify-between gap-2 uppercase font-display tracking-widest text-[10px] font-bold"
                        >
                            <span className="truncate">{MENU_DATA.find(c => c.id === activeCategoryId)?.name || 'Select Category'}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                        </button>

                        {/* Dropdown Menu */}
                        <div id="mobile-cat-menu" className="hidden absolute top-full left-0 right-0 mt-1 bg-[#1e293b] border border-[#C5A059]/50 shadow-xl rounded-sm overflow-hidden z-[60]">
                            {MENU_DATA.map((cat) => (
                                <div
                                    key={cat.id}
                                    onClick={() => {
                                        handleCategoryClick(cat.id);
                                        const menu = document.getElementById('mobile-cat-menu');
                                        if (menu) menu.classList.add('hidden');
                                    }}
                                    className={`
                                        px-4 py-3 text-[10px] uppercase font-display tracking-wider border-b border-[#C5A059]/10 last:border-0 cursor-pointer hover:bg-[#C5A059]/10 transition-colors
                                        ${activeCategoryId === cat.id ? 'text-[#C5A059] bg-[#C5A059]/5' : 'text-[#E5D9B6]/70'}
                                    `}
                                >
                                    {cat.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                // DESKTOP: LEFT VERTICAL TABS
                <div className="absolute top-[5%] bottom-[5%] -left-[20px] w-[120px] z-50 flex flex-col justify-center gap-1 py-10">
                    {MENU_DATA.map((cat, index) => {
                        const isActive = activeCategoryId === cat.id;
                        const styleClass = BOOKMARK_STYLES[index % BOOKMARK_STYLES.length];
                        return (
                            <div
                                key={cat.id}
                                onClick={() => handleCategoryClick(cat.id)}
                                className={`
                                    relative h-12 lg:h-14 cursor-pointer transition-all duration-300 ease-out flex items-center
                                    ${isActive ? 'translate-x-6' : 'translate-x-2 hover:translate-x-4 opacity-100'}
                                `}
                            >
                                <div className={`
                                    w-full h-full 
                                    ${styleClass} 
                                    border-t border-b border-l border-[#C5A059]/40
                                    rounded-l-md
                                    shadow-[2px_2px_5px_rgba(0,0,0,0.5)]
                                    flex items-center justify-end pr-4 pl-2
                                `}>
                                    <span className={`
                                        font-display text-[10px] lg:text-xs font-bold uppercase tracking-widest text-right leading-tight
                                        ${isActive ? 'text-[#C5A059]' : 'text-[#E5D9B6]/60'}
                                    `}>
                                        {cat.name}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            {/* NAVIGATION BUTTONS (Mobile & Desktop) */}
            {/* PREV BUTTON */}
            <button
                onClick={handlePrev}
                disabled={currentPage <= 1}
                className={`
                    absolute top-1/2 -translate-y-1/2 z-50 
                    w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#06181F]/80 border border-[#C5A059] text-[#C5A059] 
                    flex items-center justify-center shadow-lg hover:bg-[#C5A059] hover:text-[#06181F] transition-all
                    ${currentPage <= 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                    ${isMobile ? 'left-4' : 'left-30'}
                `}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </button>

            {/* NEXT BUTTON */}
            <button
                onClick={handleNext}
                className={`
                    absolute top-1/2 -translate-y-1/2 z-50 
                    w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#06181F]/80 border border-[#C5A059] text-[#C5A059] 
                    flex items-center justify-center shadow-lg hover:bg-[#C5A059] hover:text-[#06181F] transition-all
                    ${isMobile ? 'right-4 md:right-8' : 'right-5'}
                `}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </button>


            <div className="relative w-full" style={{ aspectRatio: isMobile ? '3 / 4' : '3 / 2' }}>
                <div className="relative w-full h-full">
                    {/* CSS BOOK COVER */}
                    <div className="absolute inset-0 w-full h-full bg-[#06181F] rounded-[1%] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-[8px] border-[#1e293b] overflow-hidden">
                        {/* Texture/Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-black/20 pointer-events-none" />

                        {/* Central Spine */}
                        <div className={`absolute top-0 bottom-0 ${isMobile ? 'left-0 w-[8px]' : 'left-1/2 -translate-x-1/2 w-[4%]'} bg-[#06181F] shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] z-0`}>
                            <div className="w-full h-full bg-gradient-to-r from-black/40 via-transparent to-black/40" />
                        </div>
                    </div>

                    <div
                        ref={paperWrapperRef}
                        className={`absolute inset-0 top-[3%] bottom-[3%] ${isMobile ? 'left-[4%] right-[2%]' : 'left-[2%] right-[2%]'}`}
                    >
                        {isReady && (
                            <HTMLFlipBook
                                key={`${isMobile ? 'mobile' : 'desktop'}-${bookDimensions.width}-${bookDimensions.height}`}
                                width={bookDimensions.width}
                                height={bookDimensions.height}
                                size="fixed"
                                minWidth={200}
                                maxWidth={1000}
                                minHeight={300}
                                maxHeight={1500}
                                maxShadowOpacity={isMobile ? 0.1 : 0.5}
                                showCover={!isMobile}
                                mobileScrollSupport={true}
                                className="shadow-md"
                                style={{}}
                                flippingTime={isMobile ? 600 : 1000}
                                startPage={1}
                                drawShadow={!isMobile} // Disable shadows on mobile to avoid "ugly" dark streaks
                                autoSize={true}
                                ref={bookRef}
                                clickEventForward={true}
                                useMouseEvents={false}
                                onFlip={(e) => setCurrentPage(e.data)}
                                usePortrait={isMobile} 
                                startZIndex={0} 
                                swipeDistance={0} 
                                showPageCorners={false} 
                                disableFlipByClick={false}
                            >
                                {/* DUMMY PAGE 0 (Spacer for alignment) */}
                                <Page number={0} className="w-full h-full bg-transparent" key="spacer">
                                    <div className="w-full h-full pointer-events-none" />
                                </Page>

                                {/* DYNAMIC SPREADS - FLATTENED */}
                                {spreads.flatMap((spread, idx) => {
                                    if (isMobile) {
                                        // Mobile: Return Single Item Page
                                        return [
                                            <Page number={spread.pageIndex} key={`spread-${idx}-mobile`}>
                                                <RightPage
                                                    title={spread.category.name}
                                                    items={spread.items}
                                                    onItemClick={setSelectedItem}
                                                    onAddToCart={onAddToCart}
                                                />
                                            </Page>
                                        ];
                                    } else {
                                        // Desktop: Return Pair (Left + Right)
                                        return [
                                            /* LEFT PAGE: Categories */
                                            <Page number={spread.pageIndex} key={`spread-${idx}-left`}>
                                                <LeftPage
                                                    categories={MENU_DATA}
                                                    activeCategoryId={spread.category.id}
                                                    onCategoryClick={handleCategoryClick}
                                                />
                                            </Page>,
                                            /* RIGHT PAGE: Items */
                                            <Page number={spread.pageIndex + 1} key={`spread-${idx}-right`}>
                                                <RightPage
                                                    title={spread.category.name}
                                                    items={spread.items}
                                                    onItemClick={setSelectedItem}
                                                    onAddToCart={onAddToCart}
                                                />
                                            </Page>
                                        ];
                                    }
                                })}
                            </HTMLFlipBook>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
