"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

type Item = {
  title: string;
  tag: string;
  num: string;
  img: string;
  desc: string;
};

export function V2Composition() {
  const t = useTranslations("DishDetailsV2.Composition");

  const ITEMS: Item[] = [
    {
      title: t("item_1_title"),
      tag: t("item_1_tag"),
      num: "01",
      img: "/images/dish-detail-v2/v2-composition-rice/v2-composition-rice.png",
      desc: t("item_1_desc"),
    },
    {
      title: t("item_2_title"),
      tag: t("item_2_tag"),
      num: "02",
      img: "/images/dish-detail-v2/v2-composition-mekong/v2-composition-mekong.png",
      desc: t("item_2_desc"),
    },
    {
      title: t("item_3_title"),
      tag: t("item_3_tag"),
      num: "03",
      img: "/images/dish-detail-v2/v2-composition-mam-ruoc/v2-composition-mam-ruoc.png",
      desc: t("item_3_desc"),
    },
  ];

  const STATS: Array<[string, string]> = [
    [t("stat_curing"), t("stat_curing_val")],
    [t("stat_cal"), t("stat_cal_val")],
    [t("stat_spice"), t("stat_spice_val")],
    [t("stat_allergen"), t("stat_allergen_val")],
  ];

  return (
    <section className="w-full bg-white py-16 md:py-24 lg:py-32">
      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6">
        <div className="bg-stone-100 px-4 py-16 md:px-6 md:py-24 lg:py-32">
          <div className="text-center">
            <div className="text-orange-300 text-[10px] font-extrabold uppercase tracking-[4px] md:text-xs md:tracking-[6px]">
              {t("label")}
            </div>
            <h3 className="mt-3 text-blue-950 text-3xl font-[var(--font-playfair)] leading-[36px] md:mt-4 md:text-4xl md:leading-[42px] lg:text-5xl lg:leading-[48px]">
              {t("title")}
            </h3>
            <div className="mx-auto mt-6 h-8 w-px bg-orange-300/40 md:mt-8 md:h-12" />
          </div>

          <div className="mt-12 grid grid-cols-1 gap-px bg-blue-950/10 outline outline-1 outline-blue-950/10 md:mt-16 lg:mt-24 lg:grid-cols-3">
            {ITEMS.map((x) => (
              <div key={x.num} className="bg-stone-100 p-6 md:p-8 lg:p-12">
                <div className="relative h-64 w-full overflow-hidden rounded-xl bg-white md:h-80 lg:h-96">
                  <Image src={x.img} alt={x.title} fill className="object-cover" width={1920} height={1080}/>
                </div>

                <div className="mt-6 flex items-start justify-between md:mt-8 lg:mt-10">
                  <div>
                    <div className="text-blue-950 text-xl font-[var(--font-playfair)] leading-7 md:text-2xl md:leading-8">
                      {x.title}
                    </div>
                    <div className="mt-2 text-orange-300 text-[8px] font-extrabold uppercase tracking-[2.4px] md:mt-3 md:text-[9px] md:tracking-[2.7px]">
                      {x.tag}
                    </div>
                  </div>
                  <div className="text-blue-950/20 text-3xl font-[var(--font-playfair)] leading-9 md:text-4xl md:leading-10">
                    {x.num}
                  </div>
                </div>

                <p className="mt-5 text-blue-950/60 text-sm leading-6 font-[var(--font-inter)] md:mt-6 lg:mt-8">
                  {x.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-2 gap-8 border-t border-blue-950/5 pt-10 md:mt-12 md:gap-10 md:pt-12 lg:mt-16 lg:gap-12 lg:grid-cols-4 lg:pt-16">
            {STATS.map(([k, v]) => (
              <div key={k} className="text-center">
                <div className="text-blue-950/40 text-[9px] font-extrabold uppercase tracking-[2.7px]">
                  {k}
                </div>
                <div className="mt-2 text-blue-950 text-xl font-[var(--font-playfair)] leading-7">
                  {v}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
