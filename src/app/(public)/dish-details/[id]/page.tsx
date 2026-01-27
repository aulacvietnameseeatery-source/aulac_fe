"use client";

import { useEffect, useState } from "react";
import {
  DishBreadcrumb,
  DishHero,
  DishNarrative,
  DishComposition,
  OrderPopup,
} from "@/features/dish-details";


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
      <DishHero onOrderNow={() => setOpenPopup(true)} />

      {/* Section 2 */}
      <section className="mx-auto w-full max-w-[1200px] px-4 pb-20 pt-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
          <DishNarrative />
          <DishComposition />
        </div>
      </section>

      <OrderPopup open={openPopup} onClose={() => setOpenPopup(false)} />
    </div>
  );
}
