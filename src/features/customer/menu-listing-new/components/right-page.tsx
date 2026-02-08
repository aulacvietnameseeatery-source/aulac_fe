import { MenuCard } from "@/features/customer/menu-listing-new/components/menu-card";

// DATA MỚI (4 MÓN)
const MAIN_COURSES = [
    {
        name: "Filetto di Manzo",
        price: "45 CHF",
        desc: "File mignon with red wine reduction.",
        image: "/images/menu-listing/menu-grid/Grilled Premium Wagyu Beef.png"
    },
    {
        name: "Branzino al Forno",
        price: "38 CHF",
        desc: "Roasted sea bass with cherry tomatoes.",
        image: "/images/menu-listing/menu-grid/Grilled Premium Wagyu Beef.png"
    },
    {
        name: "Agnello Brasato",
        price: "40 CHF",
        desc: "Braised lamb shank with polenta.",
        image: "/images/menu-listing/menu-grid/Grilled Premium Wagyu Beef.png"
    },
    {
        name: "Osso Buco",
        price: "42 CHF",
        desc: "Veal shanks braised with vegetables.",
        image: "/images/menu-listing/menu-grid/Grilled Premium Wagyu Beef.png"
    },
];
export const RightPage = () => {
    return (
        <div className="w-[45.1%] ml-[4.06%] relative flex flex-col h-[104%] mt-[-1%]">

            <img src="/images/menu-listing/layer2B.2.png" className="absolute inset-0 w-full h-full object-fill z-0 pointer-events-none" />
            <div className="absolute inset-y-0 left-0 w-[15%] bg-gradient-to-r from-black/40 to-transparent z-0 pointer-events-none"></div>

            {/* THAY ĐỔI 1: py-[6%] (Giảm từ 8% xuống 6% để mở rộng không gian dọc)
               THAY ĐỔI 2: pr-[12%] (Giảm lề phải một chút để nội dung to ra ngang)
            */}
            <div className="absolute inset-3 pl-[8%] pr-[12%] py-[6%] pb-[7%] flex flex-col z-10">

                {/* HEADER - Giảm margin bottom (mb-2) */}
                <div className="text-center mb-6 shrink-0">
                    <h1 className="text-lg lg:text-xl text-[#C5A059] font-display uppercase tracking-[0.2em]">
                        Main Courses
                    </h1>
                    <div className="w-12 h-[1px] bg-[#C5A059]/50 mx-auto mt-1"></div>
                </div>

                {/* GRID 4 MÓN:
                   - gap-y-2: Khoảng cách hàng rất nhỏ (0.5rem) để ép gọn.
                   - gap-x-4: Khoảng cách ngang.
                   - overflow-hidden: Tắt thanh cuộn tuyệt đối.
                */}
                <div className=" grid grid-cols-2 gap-x-4 gap-y-25 grow content-start overflow-hidden">
                    {MAIN_COURSES.map((item, idx) => (
                        <MenuCard key={idx} {...item} />
                    ))}
                </div>

                {/* WINE PAIRING FOOTER - Giảm chiều cao xuống h-16 (64px) */}
                <div className="mt-2 shrink-0 border-t border-[#C5A059]/30 pt-2">
                    <div className="relative h-16 w-full rounded border border-[#C5A059]/20 overflow-hidden group cursor-pointer shadow-lg">
                        {/* Ảnh nền mờ */}
                        <div className="absolute inset-0">
                            <img src="/images/menu-listing/menu-grid/Grilled Premium Wagyu Beef.png" className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity transform group-hover:scale-105 duration-700"/>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#0f172a]/90 to-transparent"></div>

                        {/* Nội dung Footer - Font bé lại cho vừa h-16 */}
                        <div className="relative h-full flex items-center justify-between px-3 z-10">
                            <div className="flex flex-col justify-center">
                                <span className="text-[#C5A059] text-[7px] uppercase tracking-[0.2em] mb-0.5">Sommelier's Choice</span>
                                <h4 className="text-white font-display text-xs lg:text-sm italic leading-tight">Château Margaux 2015</h4>
                                <p className="text-[#E5D9B6]/60 text-[8px]">Premier Grand Cru Classé</p>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                                <span className="text-[#C5A059] font-display font-bold text-xs">120 CHF</span>
                                <button className="px-2 py-[2px] bg-[#C5A059] text-[#0f172a] text-[7px] font-bold uppercase tracking-widest hover:bg-white transition-colors rounded-sm">
                                    Bottle
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};