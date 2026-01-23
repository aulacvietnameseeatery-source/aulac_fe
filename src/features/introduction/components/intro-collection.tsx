import { cn } from "@/lib/utils";

const COLLECTION_ITEMS = [
    {
        id: 1,
        image: "intro-collection-dish1.png",
        hoverCategory: "Heritage Selection",
        hoverTitle: "Lotus Root Salad",
        hoverDesc: "Artfully plated with edible gold leaf and a reduction of aged Vietnamese vinegar.",
        mainTitle: "The Imperial Lotus",
        subTitle: "Sculpted Freshness",
    },
    {
        id: 2,
        image: "intro-collection-dish2.png",
        hoverCategory: "Slow-Cooked",
        hoverTitle: "Claypot Fish",
        hoverDesc: "Red Snapper simmered for 6 hours in a traditional ceramic vessel with black pepper and palm sugar.",
        mainTitle: "Ocean Umami",
        subTitle: "24-Hour Infusion",
    },
    {
        id: 3,
        image: "intro-collection-dish3.png",
        hoverCategory: "Signature",
        hoverTitle: "Heritage Pho",
        hoverDesc: "A symphony of 24-hour bone broth infused with star anise and rare wagyu cuts.",
        mainTitle: "The Golden Broth",
        subTitle: "The Heart of Hanoi",
    },
];

export function IntroCollection() {
    return (
        <section className="w-full bg-[#F6F4EF] py-24 px-4 md:px-8 lg:px-20 flex justify-center">
            <div className="w-full max-w-[1440px] flex flex-col gap-20">

                {/* --- HEADER --- */}
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="flex flex-col items-center gap-2">
            <span className="font-display text-[#C9A961] text-xs font-bold uppercase tracking-[0.5em]">
              Collection
            </span>
                        <h2 className="font-display text-[#0A0A0A] text-4xl md:text-5xl font-bold leading-tight">
                            Signature Masterpieces
                        </h2>
                    </div>
                    {/* Decorative Spacer */}
                    <div className="w-16 h-8" />
                </div>

                {/* --- GRID ITEMS --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {COLLECTION_ITEMS.map((item) => (
                        <div key={item.id} className="flex flex-col gap-6 group cursor-pointer">

                            {/* IMAGE CARD (Có hiệu ứng Hover) */}
                            <div className="relative w-full aspect-[3/4] overflow-hidden rounded-[4px] border border-[#C9A961]/20 bg-[#193752]/10">
                                <img
                                    src={item.image}
                                    alt={item.mainTitle}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />

                                {/* Overlay: Hiện ra khi hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#193752]/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                  <span className="font-display text-[#C9A961] text-xs uppercase tracking-widest mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                    {item.hoverCategory}
                  </span>
                                    <h3 className="font-display text-white text-2xl font-bold mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                                        {item.hoverTitle}
                                    </h3>
                                    <p className="font-display text-white/80 text-sm leading-relaxed translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-150">
                                        {item.hoverDesc}
                                    </p>
                                </div>
                            </div>

                            {/* TEXT INFO (Bên dưới ảnh) */}
                            <div className="flex flex-col items-center text-center space-y-2">
                                <h4 className="font-display text-[#C9A961] text-lg font-medium">
                                    {item.mainTitle}
                                </h4>
                                <span className="font-display text-[#0A0A0A] text-sm uppercase tracking-widest">
                  {item.subTitle}
                </span>
                            </div>

                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}