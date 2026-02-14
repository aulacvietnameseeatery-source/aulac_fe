"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

export function V2Video() {
  const t = useTranslations("DishDetailsV2.Video");

  return (
    <section className="relative w-full bg-black">
      <div className="relative h-[600px] w-full overflow-hidden md:h-[900px] lg:h-[1200px]">
        <Image
          width={1920}
          height={1080}
          src="/images/dish-detail-v2/v2-video/v2-video.png"
          alt="Video placeholder"
          fill
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-blue-950/20" />

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full outline outline-1 outline-white/30 md:h-28 md:w-28 lg:h-32 lg:w-32">
            <div className="icon text-white text-2xl md:text-3xl lg:text-4xl">▶</div>
          </div>
          <div className="pt-6 text-white text-2xl font-[var(--font-playfair)] leading-7 tracking-wide md:pt-8 md:text-3xl md:leading-9 lg:pt-10 lg:text-4xl lg:leading-10">
            {t("title")}
          </div>
          <div className="pt-3 text-white/60 text-[8px] font-bold uppercase tracking-[3px] md:text-[9px] md:tracking-[3.5px] lg:pt-4 lg:text-[10px] lg:tracking-[4px]">
            {t("subtitle")}
          </div>
        </div>

        <div className="absolute right-4 bottom-6 flex gap-6 md:right-10 md:bottom-10 md:gap-10 lg:right-16 lg:bottom-16 lg:gap-12">
          <div className="text-right">
            <div className="text-white/40 text-[7px] font-bold uppercase tracking-wide md:text-[8px]">
              {t("duration_label")}
            </div>
            <div className="text-white/40 text-xs leading-4 md:text-sm md:leading-5">{t("duration_value")}</div>
          </div>
          <div className="text-right">
            <div className="text-white/40 text-[7px] font-bold uppercase tracking-wide md:text-[8px]">
              {t("resolution_label")}
            </div>
            <div className="text-white/40 text-xs leading-4 md:text-sm md:leading-5">{t("resolution_value")}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
