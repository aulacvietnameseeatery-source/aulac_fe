"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

type Props = {
  onOrderNow: () => void;
};

export function V2Hero360({ onOrderNow }: Props) {
  const t = useTranslations("DishDetailsV2.Hero");

  return (
    <section className="relative w-full bg-black overflow-hidden">
      <div className="relative h-[600px] w-full md:h-[900px] lg:h-[1153px]">
        <Image
          src="/images/dish-detail-v2/v2-hero/v2-hero.png"
          alt="Dish hero"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/0 to-black/20" />

        {/* Order Now button (giống vị trí version 1) */}
        <button
          type="button"
          onClick={onOrderNow}
          className="absolute bottom-4 right-4 z-10 h-10 w-24 rounded-lg bg-amber-400 shadow-lg md:right-[150px] md:top-[492px] md:bottom-auto md:h-11 md:w-28"
        >
          <span className="text-blue-950 text-xs font-medium md:text-sm">{t("order_now")}</span>
        </button>

        {/* Center badge */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-black/20 px-8 pt-6 pb-8 backdrop-blur-sm outline outline-1 outline-white/10 flex flex-col items-center gap-2 md:px-10 md:pt-8 md:pb-10 md:gap-2.5">
            <div className="text-white text-2xl md:text-3xl">⟲</div>
            <div className="text-white/80 text-[8px] font-bold uppercase tracking-[4px] md:text-[10px] md:tracking-[5px]">
              {t("hold_rotate")}
            </div>
          </div>
        </div>

        {/* Bottom-left title */}
        <div className="absolute left-4 bottom-6 flex flex-col gap-1.5 md:left-12 md:bottom-12 md:gap-2">
          <div className="text-orange-300 text-[10px] font-bold uppercase tracking-[4px] md:text-xs md:tracking-[6px]">
            {t("label")}
          </div>
          <div className="text-white text-2xl font-[var(--font-playfair)] leading-7 md:text-4xl md:leading-10">
            {t("title")}
          </div>
        </div>
      </div>
    </section>
  );
}
