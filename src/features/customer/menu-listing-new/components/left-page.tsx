export const LeftPage = () => {
    return (
        <div className="w-[44.1%] ml-[4%] relative flex flex-col h-[103.3%] mt-[-0.8%]">

            <img src="/images/menu-listing/layer2B.1.png" className="absolute inset-0 w-full h-full object-fill z-0 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0f172a]/10 to-[#0f172a]/30 z-0 pointer-events-none"></div>

            <div className="absolute inset-3 pl-[12%] pr-[9%] py-[8%] flex flex-col z-10">

                {/* --- HERO SECTION --- */}
                <div className="flex-1 flex flex-col items-center justify-center text-center mt-[-10%]">
                    <div className="mb-2 pb-4  text-[10px]  uppercase tracking-widest">
                        <span className="text-[#C5A059] text-[20px] tracking-[0.3em] uppercase border-b border-[#C5A059]/50 pb-1">
                            Chef's Selection
                        </span>
                    </div>

                    <div className="relative w-[65%] aspect-square rounded-t-full p-1 border border-[#C5A059]/60 mb-3 group shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
                        <div className="w-full h-full rounded-t-full overflow-hidden relative">
                            <img src="/images/menu-listing/menu-grid/Grilled Premium Wagyu Beef.png" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                        </div>
                    </div>

                    <h2 className="font-display text-2xl text-[#C5A059] mb-1 leading-tight">
                        Risotto al Tartufo
                    </h2>

                    <p className="font-sans text-[#E5D9B6]/80 text-[10px] font-light mt-1 max-w-[90%] leading-relaxed line-clamp-3">
                        Arborio rice slow-cooked with black truffle shavings and parmigiano-reggiano.
                    </p>

                    <div className="mt-3 flex items-center gap-3">
                        <span className="text-white font-display font-bold text-xl">42 CHF</span>
                        <button className="px-4 py-1 bg-[#C5A059] text-[#0f172a] text-[9px] font-bold uppercase tracking-widest hover:bg-white transition-colors shadow-lg">
                            Order
                        </button>
                    </div>
                </div>

                {/* --- SIDE DISHES (NEW LAYOUT: HORIZONTAL CARDS) --- */}
                <div className="mt-auto w-full pt-3 border-t border-[#C5A059]/20 flex flex-col gap-3">
                    <p className="text-center text-[#C5A059]/60 text-[8px] uppercase tracking-widest mb-1">Perfect Complements</p>

                    {/* Side Dish 1 */}
                    <div className="flex items-center gap-3 bg-[#0f172a]/40 p-2 border border-[#C5A059]/10 rounded hover:border-[#C5A059]/40 transition-all cursor-pointer group">
                        {/* Ảnh chữ nhật nhỏ */}
                        <div className="w-12 h-10 overflow-hidden rounded border border-[#C5A059]/20 shrink-0">
                            <img src="/images/menu-listing/menu-grid/Grilled Premium Wagyu Beef.png" className="w-full h-full object-cover"/>
                        </div>
                        {/* Thông tin */}
                        <div className="flex-1">
                            <h4 className="text-[#C5A059] text-[10px] uppercase font-bold mb-0.5 group-hover:text-white">Asparagi al Burro</h4>
                            <p className="text-[#E5D9B6]/60 text-[8px] italic line-clamp-1">Fresh asparagus with butter sauce.</p>
                        </div>
                        {/* Giá & Nút */}
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-white font-display text-[11px] font-bold">12 CHF</span>
                            <button className="text-[8px] text-[#C5A059] border border-[#C5A059] px-2 py-0.5 hover:bg-[#C5A059] hover:text-black uppercase">Add</button>
                        </div>
                    </div>

                    {/* Side Dish 2 */}
                    <div className="flex items-center gap-3 bg-[#0f172a]/40 p-2 border border-[#C5A059]/10 rounded hover:border-[#C5A059]/40 transition-all cursor-pointer group">
                        <div className="w-12 h-10 overflow-hidden rounded border border-[#C5A059]/20 shrink-0">
                            <img src="/images/menu-listing/menu-grid/Grilled Premium Wagyu Beef.png" className="w-full h-full object-cover"/>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-[#C5A059] text-[10px] uppercase font-bold mb-0.5 group-hover:text-white">Patate Arrosto</h4>
                            <p className="text-[#E5D9B6]/60 text-[8px] italic line-clamp-1">Roasted potatoes with rosemary.</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-white font-display text-[11px] font-bold">9 CHF</span>
                            <button className="text-[8px] text-[#C5A059] border border-[#C5A059] px-2 py-0.5 hover:bg-[#C5A059] hover:text-black uppercase">Add</button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};