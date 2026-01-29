"use client";

import { useTranslations } from "next-intl";

type Props = {
  onReserve: () => void;
};

export function V2CTA({ onReserve }: Props) {
  const t = useTranslations("DishDetailsV2.CTA");

  return (
    <section className="w-full bg-blue-950 py-32">
      <div className="mx-auto max-w-[1400px] px-6 text-center space-y-12">
        <h4 className="text-white text-6xl md:text-7xl font-[var(--font-playfair)] leading-[1.05]">
          Experience the tradition.
        </h4>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-sm bg-orange-300 px-16 py-5 shadow-2xl"
          onClick={onReserve}
        >
          <span className="text-blue-950 text-xs font-bold uppercase tracking-[3.6px]">
            {t("reserve")}
          </span>
        </button>
      </div>
    </section>
  );
}
