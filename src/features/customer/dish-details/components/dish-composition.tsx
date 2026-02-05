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
    </aside>
  );
}
