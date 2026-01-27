"use client";

import { MenuCard, MenuItem, OrderEvent } from "./menu-card";
import Link from "next/link";

// Mock Data
const MENU_ITEMS: MenuItem[] = [
    {
        id: "1",
        name: "Grilled Premium Wagyu Beef",
        description: "Japanese A5 Wagyu beef grilled over charcoal, served with seasonal vegetables and truffle sauce.",
        price: 45,
        category: "Premium",
        image: "/images/menu-listing/menu-grid/Grilled Premium Wagyu Beef.png",
    },
    {
        id: "2",
        name: "Lobster Thermidor",
        description: "Fresh lobster prepared in classic French style, topped with creamy golden sauce and herbs.",
        price: 52,
        category: "Seafood",
        image: "/images/menu-listing/menu-grid/Lobster Thermidor.png",
    },
    {
        id: "3",
        name: "Peking Duck",
        description: "Crispy golden duck served with warm crepes, scallions, and our signature house sauce.",
        price: 28,
        category: "Signature",
        image: "/images/menu-listing/menu-grid/Peking Duck.png",
    },
    {
        id: "4",
        name: "Truffle Mushroom Risotto",
        description: "Creamy Arborio rice cooked slowly with Gruyère, white wine, and black truffle shavings.",
        price: 22,
        category: "Italian",
        image: "/images/menu-listing/menu-grid/Truffle Mushroom Risotto.png",
    },
    {
        id: "5",
        name: "Smoked Salmon",
        description: "House-smoked salmon served with crème fraîche, fresh microgreens, and toasted rye.",
        price: 25,
        category: "Seafood",
        image: "/images/menu-listing/menu-grid/Smoked Salmon.png",
    },
    {
        id: "6",
        name: "Tiramisu",
        description: "Classic Italian dessert made with mascarpone, ladyfingers soaked in espresso and cocoa.",
        price: 8,
        category: "Desserts",
        image: "/images/menu-listing/menu-grid/Tiramisu.png",
    },
    {
        id: "7",
        name: "Korean Grilled Beef",
        description: "Thin-sliced beef grilled tableside over charcoal, served with fresh vegetables and gochujang sauce.",
        price: 27,
        category: "Premium",
        image: "/images/menu-listing/menu-grid/Korean Grilled Beef.png",
    },
    {
        id: "8",
        name: "Krug Clos d'Ambonnay",
        description: "Luxury champagne with complex aromas and refined tasting notes, perfect for celebration.",
        price: 125,
        category: "Beverages",
        image: "/images/menu-listing/menu-grid/Krug Clos d'Ambonnay Champagne.png",
    },
];

// Nhận prop onOrder từ Page truyền xuống
export function MenuGrid({ onOrder }: { onOrder?: (event: OrderEvent) => void }) {
    return (
        <section className="w-full bg-[#FAF9F6] py-16 md:py-24">
            <div className="mx-auto max-w-[1280px] px-4 md:px-8">
                {/* Header Section */}
                <div className="mb-16 text-center">
                    <h2 className="mb-4 font-display text-[48px] font-bold leading-none text-[#0A0A0A]">
                        Fine Dining Menu
                    </h2>
                    <p className="mx-auto max-w-[600px] font-body text-[18px] text-[#7A7A7A] leading-[29px]">
                        Experience exquisite cuisine from world-class chefs, blending traditional Vietnamese flavors with modern culinary techniques.
                    </p>
                    <div className="mt-8 flex justify-center">
                        <Link
                            href="/reservation"
                            className="group flex items-center gap-2 text-[16px] font-medium text-[#1A3A52] transition-colors hover:text-[#D4A574]"
                        >
                            <span className="border-b border-transparent group-hover:border-[#D4A574] transition-all">
                                Not sure what to eat? Book your table first
                            </span>
                            <span className="transition-transform duration-300 group-hover:translate-x-1">
                                →
                            </span>
                        </Link>
                    </div>
                </div>

                {/* Grid Section - Truyền onOrder xuống từng Card */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {MENU_ITEMS.map((item) => (
                        <MenuCard
                            key={item.id}
                            item={item}
                            onOrder={onOrder}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}