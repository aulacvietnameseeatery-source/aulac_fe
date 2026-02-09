import { MenuCard, MenuItem } from "@/features/customer/menu-listing-new/components/menu-card";

// DATA MỚI (4 MÓN)
const MAIN_COURSES = [
    { id: "main-1", name: "Filetto di Manzo", price: "45 CHF", desc: "File mignon...", image: "/images/menu-listing/menu-grid/Grilled Premium Wagyu Beef.png" },
    { id: "main-2", name: "Branzino al Forno", price: "38 CHF", desc: "Roasted sea bass...", image: "/images/menu-listing/menu-grid/Grilled Premium Wagyu Beef.png" },
    { id: "main-3", name: "Agnello Brasato", price: "40 CHF", desc: "Braised lamb...", image: "/images/menu-listing/menu-grid/Grilled Premium Wagyu Beef.png" },
    { id: "main-4", name: "Osso Buco", price: "42 CHF", desc: "Veal shanks...", image: "/images/menu-listing/menu-grid/Grilled Premium Wagyu Beef.png" },
];

interface PageProps {
    onOrder: (item: MenuItem, startPos: { x: number; y: number }) => void;
}

export const RightPage = ({ onOrder }: PageProps) => {

    // Wrapper cho Wine
    const handleQuickOrder = (e: React.MouseEvent, itemData: MenuItem) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const startPos = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        onOrder(itemData, startPos);
    };

    return (
        <div className="w-[45.1%] ml-[4.06%] relative flex flex-col h-[104%] mt-[-1%]">
            {/* ... (Giữ nguyên Background) ... */}
            <img src="/images/menu-listing/layer2B.2.png" className="absolute inset-0 w-full h-full object-fill z-0 pointer-events-none" />
            <div className="absolute inset-y-0 left-0 w-[15%] bg-gradient-to-r from-black/40 to-transparent z-0 pointer-events-none"></div>

            <div className="absolute inset-3 pl-[8%] pr-[12%] py-[6%] pb-[7%] flex flex-col z-10">
                {/* HEADER */}
                <div className="text-center mb-6 shrink-0">
                    <h1 className="text-lg lg:text-xl text-[#C5A059] font-display uppercase tracking-[0.2em]">Main Courses</h1>
                    <div className="w-12 h-[1px] bg-[#C5A059]/50 mx-auto mt-1"></div>
                </div>

                {/* GRID */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-25 grow content-start overflow-hidden">
                    {MAIN_COURSES.map((item, idx) => (
                        <MenuCard
                            key={idx}
                            {...item}
                            // Giá trong MenuCard nhận string để hiển thị, nhưng trong item gốc cần có number để tính tiền
                            // Ở đây ta cứ truyền item vào, MenuCard đã được sửa để parse giá
                            onOrder={onOrder}
                        />
                    ))}
                </div>

                {/* WINE FOOTER */}
                <div className="mt-2 shrink-0 border-t border-[#C5A059]/30 pt-2">
                    <div className="relative h-16 w-full rounded border border-[#C5A059]/20 overflow-hidden group cursor-pointer shadow-lg">
                        {/* ... (Giữ nguyên UI Wine) ... */}
                        <div className="absolute inset-0">
                            <img src="/images/menu-listing/menu-grid/Grilled Premium Wagyu Beef.png" className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity transform group-hover:scale-105 duration-700"/>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#0f172a]/90 to-transparent"></div>

                        <div className="relative h-full flex items-center justify-between px-3 z-10">
                            <div className="flex flex-col justify-center">
                                <span className="text-[#C5A059] text-[7px] uppercase tracking-[0.2em] mb-0.5">Sommelier&#39;s Choice</span>
                                <h4 className="text-white font-display text-xs lg:text-sm italic leading-tight">Château Margaux 2015</h4>
                                <p className="text-[#E5D9B6]/60 text-[8px]">Premier Grand Cru Classé</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-[#C5A059] font-display font-bold text-xs">120 CHF</span>
                                <button
                                    onClick={(e) => handleQuickOrder(e, { id: 'wine-1', name: 'Château Margaux 2015', price: 120, image: '/images/menu-listing/menu-grid/Grilled Premium Wagyu Beef.png' })}
                                    className="px-2 py-[2px] bg-[#C5A059] text-[#0f172a] text-[7px] font-bold uppercase tracking-widest hover:bg-white transition-colors rounded-sm"
                                >Bottle</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};