"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

export function V2Cinematic() {
  const t = useTranslations("DishDetailsV2.Cinematic");

  return (
    <section className="relative w-full bg-slate-900">
      <div className="relative h-[823px] w-full overflow-hidden">
        <Image
          src="/images/dish-detail-v2/v2-cinematic/v2-cinematic.png"
          alt="Cinematic dish detail"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/0 to-slate-900/0" />

        <div className="absolute left-16 bottom-16 max-w-[512px] space-y-4">
          <div className="text-orange-300 text-[10px] font-bold uppercase tracking-[4px]">
            {t("label")}
          </div>
          <div className="text-white text-4xl font-[var(--font-playfair)] leading-10">
            {t("title")}
          </div>
          <p className="text-white/60 text-sm leading-6 tracking-tight">
            {t("description")}
          </p>
        </div>
      </div>
    </section>
  );
}
