"use client";

import { useTranslations } from "next-intl";

type CompositionItem = {
  title: string;
  sub: string;
  desc: string;
  img: string;
};

export function DishComposition() {
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
    <aside className="border-l border-slate-200 pl-0 lg:pl-8">
      <div className="text-sm font-bold uppercase tracking-[2.80px] text-blue-800">
        {t("label")}
      </div>

      {COMPOSITION.map((it) => (
        <div key={it.title} className="mt-10 flex gap-6">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-gray-100 md:h-28 md:w-28">
            <img src={it.img} alt={it.title} className="h-full w-full object-cover" />
          </div>

          <div className="pt-1">
            <div className="text-[22px] font-bold leading-7 text-neutral-900">
              {it.title}
            </div>
            <div className="mt-2 text-xs font-bold uppercase tracking-[2px] text-blue-800">
              {it.sub}
            </div>
            <p className="mt-3 text-[15px] leading-6 text-gray-500">
              {it.desc}
            </p>
          </div>
        </div>
      ))}

      {/* Stats */}
      <div className="mt-12 border-t border-slate-200 pt-8">
        <div className="grid grid-cols-2 gap-x-10 gap-y-6">
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500">
              {t("stat_prep")}
            </div>
            <div className="mt-1 text-base font-medium text-neutral-900">
              {t("stat_prep_val")}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500">
              {t("stat_cal")}
            </div>
            <div className="mt-1 text-base font-medium text-neutral-900">
              {t("stat_cal_val")}
            </div>
          </div>

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
      </div>
    </aside>
  );
}
