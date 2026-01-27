"use client";

import Image from "next/image";

type Props = {
  onOrderNow: () => void;
};

export function V2Hero360({ onOrderNow }: Props) {
  return (
    <section className="relative w-full bg-black overflow-hidden">
      <div className="relative h-[1153px] w-full">
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
          className="absolute bottom-6 right-6 z-10 h-11 w-28 rounded-lg bg-amber-400 shadow-lg md:right-[150px] md:top-[492px] md:bottom-auto"
        >
          <span className="text-blue-950 text-sm font-medium">Order Now</span>
        </button>

        {/* Center badge */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-black/20 px-10 pt-8 pb-10 backdrop-blur-sm outline outline-1 outline-white/10 flex flex-col items-center gap-2.5">
            <div className="text-white text-3xl">⟲</div>
            <div className="text-white/80 text-[10px] font-bold uppercase tracking-[5px]">
              Hold &amp; Rotate View
            </div>
          </div>
        </div>

        {/* Bottom-left title */}
        <div className="absolute left-12 bottom-12 flex flex-col gap-2">
          <div className="text-orange-300 text-xs font-bold uppercase tracking-[6px]">
            Interactive Experience 01
          </div>
          <div className="text-white text-4xl font-[var(--font-playfair)] leading-10">
            Dimensional Gastronomy
          </div>
        </div>
      </div>
    </section>
  );
}
