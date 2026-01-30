"use client";

import { MenuCard, MenuItem, OrderEvent } from "./menu-card";
import Link from "next/link";
import { useTranslations } from "next-intl";

// Data gốc (Giữ nguyên cấu trúc để map translation)
const MENU_ITEMS: MenuItem[] = [
    {
        id: "1",
        translationKey: "1",
        price: 45,
        category: "Premium",
        image: "/images/menu-listing/menu-grid/Grilled Premium Wagyu Beef.png",
    },
    {
        id: "2",
        translationKey: "2",
        price: 52,
        category: "Seafood",
        image: "/images/menu-listing/menu-grid/Lobster Thermidor.png",
    },
    {
        id: "3",
        translationKey: "3",
        price: 28,
        category: "Signature",
        image: "/images/menu-listing/menu-grid/Peking Duck.png",
    },
    {
        id: "4",
        translationKey: "4",
        price: 22,
        category: "Italian",
        image: "/images/menu-listing/menu-grid/Truffle Mushroom Risotto.png",
    },
    {
        id: "5",
        translationKey: "5",
        price: 25,
        category: "Seafood",
        image: "/images/menu-listing/menu-grid/Smoked Salmon.png",
    },
    {
        id: "6",
        translationKey: "6",
        price: 8,
        category: "Desserts",
        image: "/images/menu-listing/menu-grid/Tiramisu.png",
    },
    {
        id: "7",
        translationKey: "7",
        price: 27,
        category: "Premium",
        image: "/images/menu-listing/menu-grid/Korean Grilled Beef.png",
    },
    {
        id: "8",
        translationKey: "8",
        price: 125,
        category: "Beverages",
        image: "/images/menu-listing/menu-grid/Krug Clos d'Ambonnay Champagne.png",
    },
];

export function MenuGrid({
                             onOrder,
                             activeCategory = "All",
                             searchQuery = ""
                         }: {
    onOrder?: (event: OrderEvent) => void,
    activeCategory?: string,
    searchQuery?: string
}) {
    const t = useTranslations("MenuListing.MenuGrid");

    // LOGIC LỌC MÓN ĂN
    const filteredItems = MENU_ITEMS.filter((item) => {
        const matchCategory = activeCategory === "All" || item.category === activeCategory;

        const itemName = t(`items.${item.translationKey}_name` as never).toLowerCase();
        const matchSearch = itemName.includes(searchQuery.toLowerCase());

        return matchCategory && matchSearch;
    });

    return (
        <section className="w-full bg-[#FAF9F6] py-16 md:py-24">
            <div className="mx-auto max-w-[1280px] px-4 md:px-8">
                {/* Header Section */}
                <div className="mb-16 text-center">
                    <h2 className="mb-4 font-display text-[48px] font-bold leading-none text-[#0A0A0A]">
                        {t("title")}
                    </h2>
                    <p className="mx-auto max-w-[600px] font-body text-[18px] text-[#7A7A7A] leading-[29px]">
                        {t("subtitle")}
                    </p>
                    <div className="mt-8 flex justify-center">
                        <Link
                            href="/reservation"
                            className="group flex items-center gap-2 text-[16px] font-medium text-[#1A3A52] transition-colors hover:text-[#D4A574]"
                        >
                            <span className="border-b border-transparent group-hover:border-[#D4A574] transition-all">
                                {t("book_link")}
                            </span>
                            <span className="transition-transform duration-300 group-hover:translate-x-1">
                                →
                            </span>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item) => (
                            <MenuCard
                                key={item.id}
                                item={item}
                                onOrder={onOrder}
                            />
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center text-[#7A7A7A] italic">
                            No dishes found matching your search.
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}