"use client";

import { useTranslations } from "next-intl";
import { Dish } from "../types";

type DishCompositionProps = {
  dish: Dish;
};

export function DishComposition({ dish }: DishCompositionProps) {
  const t = useTranslations("DishDetails.Composition");

  // Ảnh fix cứng, sẽ cycle lại nếu có nhiều items
  const FALLBACK_IMAGES = [
    "/images/dish-detail/dish-composition-rice/dish-compostion-rice.png",
    "/images/dish-detail/dish-composition-imperial/dish-compostion-imperial.png",
    "/images/dish-detail/dish-composition-mam-ruoc/dish-composition-mam-ruoc.png",
  ];

  return (
    <aside className="mt-8 border-t border-slate-200 pt-8 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
      <div className="font-body text-sm font-semibold text-blue-800 md:text-base">
        {t("label")}
      </div>

      {dish.composition && dish.composition.length > 0 ? (
        dish.composition.map((item, index) => (
          <div key={item.ingredientId} className="mt-6 flex gap-4 md:mt-10 md:gap-6">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100 md:h-24 md:w-24 lg:rounded-2xl lg:h-28 lg:w-28">
              <img 
                src={FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]} 
                alt={item.ingredientName} 
                className="h-full w-full object-cover" 
              />
            </div>

            <div className="pt-1">
              <div className="font-display text-lg font-semibold leading-6 text-neutral-900 md:text-xl md:leading-7">
                {item.ingredientName}
              </div>
              <div className="font-body mt-1.5 text-xs font-medium text-blue-800 md:mt-2 md:text-sm">
                {item.quantity} {item.unit}
              </div>
              {item.note && (
                <p className="mt-2 text-sm leading-5 text-gray-500 md:mt-3 md:text-[15px] md:leading-6">
                  {item.note}
                </p>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="mt-6 text-sm text-gray-500">
          {t("no_composition")}
        </div>
      )}
    </aside>
  );
}
