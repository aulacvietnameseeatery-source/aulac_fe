"use client";

import { useTranslations } from "next-intl";

export function V2Narrative() {
  const t = useTranslations("DishDetailsV2.Narrative");

  return (
    <section className="w-full bg-white py-32">
      <div className="mx-auto w-full max-w-[1400px] px-6">
        <div className="grid grid-cols-1 gap-20 lg:grid-cols-2">
          {/* Left */}
          <div className="max-w-md">
            <div className="inline-flex border border-orange-300 px-4 py-1.5">
              <span className="text-orange-300 text-[10px] font-extrabold uppercase tracking-[3px]">
                {t("tag")}
              </span>
            </div>

            <h2 className="mt-8 text-blue-950 text-6xl lg:text-7xl font-medium leading-[1.05] font-[var(--font-playfair)]">
              {t.rich("title", { br: () => <br /> })}
            </h2>

            <div className="mt-8 flex items-center gap-4">
              <div className="h-px w-12 bg-orange-300" />
              <div className="text-blue-950/40 text-[10px] font-bold uppercase tracking-[3px]">
                {t("est")}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-10 text-blue-950/80 text-xl lg:text-2xl leading-10 font-[var(--font-playfair)]">
            <div className="relative">
              <span className="absolute -left-2 top-0 text-2xl">D</span>
              <p className="pl-10">
                {t("paragraph_1").substring(1)}
              </p>
            </div>

            <p>
              {t("paragraph_2")}
            </p>

            <div className="border-l-4 border-orange-300/30 pl-8 py-2 text-blue-950/60">
              {t("paragraph_3")}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
