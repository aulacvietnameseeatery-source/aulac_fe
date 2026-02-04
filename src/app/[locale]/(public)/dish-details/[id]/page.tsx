"use client";

import { useEffect, useState } from "react";
import {
    DishBreadcrumb,
    DishHero,
    DishNarrative,
    DishComposition,
    OrderPopup,
} from "@/features/customer/dish-details";


export default function DishDetailUI1() {
    const [openPopup, setOpenPopup] = useState(false);

    useEffect(() => {
        document.body.style.overflow = openPopup ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [openPopup]);

    return (
        <div className="w-full bg-stone-50">
            {/* Section 0 */}
            <DishBreadcrumb />

            {/* Section 1 */}
            <DishHero
                onOrderNow={() => setOpenPopup(true)}
                cloudName="dkstc8tkg"        // Lấy từ Asset Home của bạn
                productTag="tiramisu_test"   // Cái Tag bạn vừa gắn cho 72 ảnh
            />

            {/* Section 2 */}
            <section className="mx-auto w-full max-w-[1200px] px-3 pb-12 pt-6 md:px-4 md:pb-16 md:pt-8 lg:pb-20 lg:pt-10">
                <div className="grid grid-cols-1 gap-8 md:gap-10 lg:grid-cols-[1fr_360px]">
                    <DishNarrative />
                    <DishComposition />
                </div>
            </section>

            <OrderPopup open={openPopup} onClose={() => setOpenPopup(false)} />
        </div>
    );
}