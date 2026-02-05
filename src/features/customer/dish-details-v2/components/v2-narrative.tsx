"use client";

import { useTranslations } from "next-intl";

export function V2Narrative() {
  const t = useTranslations("DishDetailsV2.Narrative");

  return (
    <section className="w-full bg-white py-16 md:py-24 lg:py-32">
      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6">
        <div className="grid grid-cols-1 gap-10 md:gap-16 lg:grid-cols-2 lg:gap-20">
          {/* Left */}
          <div className="max-w-md">
            <div className="inline-flex border border-orange-300 px-3 py-1 md:px-4 md:py-1.5">
              <span className="text-orange-300 text-[8px] font-extrabold uppercase tracking-[2.5px] md:text-[10px] md:tracking-[3px]">
                {t("tag")}
              </span>
            </div>

            <h2 className="mt-6 text-blue-950 text-4xl font-medium leading-[1.05] font-[var(--font-playfair)] md:mt-8 md:text-5xl lg:text-6xl xl:text-7xl">
              {t.rich("title", { br: () => <br /> })}
            </h2>

            <div className="mt-6 flex items-center gap-3 md:mt-8 md:gap-4">
              <div className="h-px w-8 bg-orange-300 md:w-12" />
              <div className="text-blue-950/40 text-[8px] font-bold uppercase tracking-[2.5px] md:text-[10px] md:tracking-[3px]">
                {t("est")}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-6 text-blue-950/80 text-base leading-7 font-[var(--font-playfair)] md:space-y-8 md:text-lg md:leading-8 lg:text-xl lg:leading-9 xl:text-2xl xl:leading-10">
            <div className="relative">
              <span className="absolute -left-2 top-0 text-xl md:text-2xl">D</span>
              <p className="pl-8 md:pl-10">
                {t("paragraph_1").substring(1)}
              </p>
            </div>

            <p>
              {t("paragraph_2")}
            </p>

            <div className="border-l-4 border-orange-300/30 pl-6 py-2 text-blue-950/60 md:pl-8">
              {t("paragraph_3")}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
