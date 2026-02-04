"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  DishBreadcrumb,
  DishHero,
  DishNarrative,
  DishComposition,
  OrderPopup,
  useDishDetail,
} from "@/features/dish-details";


export default function DishDetailUI1() {
  const params = useParams();
  const dishId = parseInt(params.id as string, 10);
  const { data: dishData, isLoading, error } = useDishDetail(dishId);
  const [openPopup, setOpenPopup] = useState(false);

  useEffect(() => {
    document.body.style.overflow = openPopup ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [openPopup]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error || !dishData?.success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="text-lg text-red-600">
          {error?.message || "Failed to load dish"}
        </div>
      </div>
    );
  }

  const dish = dishData.data;

  return (
    <div className="w-full bg-stone-50">
      {/* Section 0 */}
      <DishBreadcrumb dish={dish} />

      {/* Section 1 */}
      <DishHero dish={dish} onOrderNow={() => setOpenPopup(true)} />

      {/* Section 2 */}
      <section className="mx-auto w-full max-w-[1200px] px-3 pb-12 pt-6 md:px-4 md:pb-16 md:pt-8 lg:pb-20 lg:pt-10">
        <div className="grid grid-cols-1 gap-8 md:gap-10 lg:grid-cols-[1fr_360px]">
          <DishNarrative dish={dish} />
          <DishComposition dish={dish} />
        </div>
      </section>

      <OrderPopup open={openPopup} onClose={() => setOpenPopup(false)} dish={dish} />
    </div>
  );
}
