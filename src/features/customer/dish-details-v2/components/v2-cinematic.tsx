"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

export function V2Cinematic() {
  const t = useTranslations("DishDetailsV2.Cinematic");

  return (
    <section className="relative w-full bg-slate-900">
      <div className="relative h-[400px] w-full overflow-hidden md:h-[600px] lg:h-[823px]">
        <Image
          width={1920}
          height={1080}
          src="/images/dish-detail-v2/v2-cinematic/v2-cinematic.png"
          alt="Cinematic dish detail"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/0 to-slate-900/0" />

        <div className="absolute left-4 bottom-6 max-w-[340px] space-y-3 md:left-8 md:bottom-10 md:max-w-[440px] lg:left-16 lg:bottom-16 lg:max-w-[512px] lg:space-y-4">
          <div className="text-orange-300 text-[8px] font-bold uppercase tracking-[3px] md:text-[9px] md:tracking-[3.5px] lg:text-[10px] lg:tracking-[4px]">
            {t("label")}
          </div>
          <div className="text-white text-2xl font-[var(--font-playfair)] leading-7 md:text-3xl md:leading-9 lg:text-4xl lg:leading-10">
            {t("title")}
          </div>
          <p className="text-white/60 text-xs leading-5 tracking-tight md:text-sm md:leading-6">
            {t("description")}
          </p>
        </div>
      </div>
    </section>
  );
}
