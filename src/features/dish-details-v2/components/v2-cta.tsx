"use client";

import { useTranslations } from "next-intl";

type Props = {
  onReserve: () => void;
};

export function V2CTA({ onReserve }: Props) {
  const t = useTranslations("DishDetailsV2.CTA");

  return (
    <section className="w-full bg-blue-950 py-16 md:py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-4 text-center space-y-8 md:px-6 md:space-y-10 lg:space-y-12">
        <h4 className="text-white text-3xl font-[var(--font-playfair)] leading-[1.05] md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl">
          Experience the tradition.
        </h4>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-sm bg-orange-300 px-10 py-4 shadow-2xl md:px-12 md:py-4.5 lg:px-16 lg:py-5"
          onClick={onReserve}
        >
          <span className="text-blue-950 text-[10px] font-bold uppercase tracking-[3px] md:text-xs md:tracking-[3.6px]">
            {t("reserve")}
          </span>
        </button>
      </div>
    </section>
  );
}
