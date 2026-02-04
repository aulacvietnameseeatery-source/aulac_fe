"use client";

import { useTranslations } from "next-intl";
import { Dish } from "../types";

type CompositionItem = {
  title: string;
  sub: string;
  desc: string;
  img: string;
};

type DishCompositionProps = {
  dish: Dish;
};

export function DishComposition({ dish }: DishCompositionProps) {
  const t = useTranslations("DishDetails.Composition");

  const COMPOSITION: CompositionItem[] = [
    {
      title: t("item_1_title"),
      sub: t("item_1_sub"),
      desc: t("item_1_desc"),
      img: "/images/dish-detail/dish-composition-rice/dish-compostion-rice.png",
    },
    {
      title: t("item_2_title"),
      sub: t("item_2_sub"),
      desc: t("item_2_desc"),
      img: "/images/dish-detail/dish-composition-imperial/dish-compostion-imperial.png",
    },
    {
      title: t("item_3_title"),
      sub: t("item_3_sub"),
      desc: t("item_3_desc"),
      img: "/images/dish-detail/dish-composition-mam-ruoc/dish-composition-mam-ruoc.png",
    },
  ];

  return (
    <aside className="mt-8 border-t border-slate-200 pt-8 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
      <div className="text-xs font-bold uppercase tracking-[2.40px] text-blue-800 md:text-sm md:tracking-[2.80px]">
        {t("label")}
      </div>

      {COMPOSITION.map((it) => (
        <div key={it.title} className="mt-6 flex gap-4 md:mt-10 md:gap-6">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100 md:h-24 md:w-24 lg:rounded-2xl lg:h-28 lg:w-28">
            <img src={it.img} alt={it.title} className="h-full w-full object-cover" />
          </div>

          <div className="pt-1">
            <div className="text-lg font-bold leading-6 text-neutral-900 md:text-[22px] md:leading-7">
              {it.title}
            </div>
            <div className="mt-1.5 text-[10px] font-bold uppercase tracking-[1.8px] text-blue-800 md:mt-2 md:text-xs md:tracking-[2px]">
              {it.sub}
            </div>
            <p className="mt-2 text-sm leading-5 text-gray-500 md:mt-3 md:text-[15px] md:leading-6">
              {it.desc}
            </p>
          </div>
        </div>
      ))}

      {/* Stats */}
      <div className="mt-8 border-t border-slate-200 pt-6 md:mt-12 md:pt-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 md:gap-x-10 md:gap-y-6">
          {dish.prepTimeMinutes && (
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">
                {t("stat_prep")}
              </div>
              <div className="mt-1 text-base font-medium text-neutral-900">
                {dish.prepTimeMinutes} min
              </div>
            </div>
          )}

          {dish.calories && (
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">
                {t("stat_cal")}
              </div>
              <div className="mt-1 text-base font-medium text-neutral-900">
                {dish.calories} kcal
              </div>
            </div>
          )}

          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500">
              {t("stat_allergen")}
            </div>
            <div className="mt-1 text-base font-medium text-neutral-900">
              {t("stat_allergen_val")}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500">
              {t("stat_spice")}
            </div>
            <div className="mt-1 text-base font-medium text-orange-600">
              {t("stat_spice_val")}
            </div>
          </div>
        </div>

        {/* Price */}
        {dish.price && (
          <div className="mt-6 border-t border-slate-200 pt-6">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wide text-gray-500">Price</div>
              <div className="text-2xl font-bold text-blue-800">
                ${dish.price.toFixed(2)}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
