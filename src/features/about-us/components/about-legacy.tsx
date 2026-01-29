"use client";

import { useTranslations } from "next-intl";

export default function AboutLegacy() {
  const t = useTranslations("AboutUs.Legacy");

  return (
    <section className="w-full max-w-[1152px] px-6">
      <div className="flex flex-col items-center gap-4">
        <div className="text-center text-orange-300 text-xs font-bold uppercase tracking-[4.40px]">
          {t("est")}
        </div>

        <h2 className="text-center text-blue-950 text-5xl font-bold leading-[52px] md:text-7xl md:leading-[72px]">
          {t("title")}
        </h2>

        <div className="h-px w-16 bg-orange-300" />
      </div>

      <div className="mt-12 overflow-hidden rounded-sm shadow-2xl">
        <div className="relative h-[260px] md:h-[473px]">
          <img
            src="/images/about-us/our-legacy/our-legacy.png"
            alt="Au Lac Interior"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-blue-950/20" />
        </div>
      </div>
    </section>
  );
}
