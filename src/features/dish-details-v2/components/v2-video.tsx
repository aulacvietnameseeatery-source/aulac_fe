"use client";

import Image from "next/image";

export function V2Video() {
  return (
    <section className="relative w-full bg-black">
      <div className="relative h-[1200px] w-full overflow-hidden">
        <Image
          src="/images/dish-detail-v2/v2-video/v2-video.png"
          alt="Video placeholder"
          fill
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-blue-950/20" />

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex h-32 w-32 items-center justify-center rounded-full outline outline-1 outline-white/30">
            <div className="icon text-white text-4xl">▶</div>
          </div>
          <div className="pt-10 text-white text-4xl font-[var(--font-playfair)] leading-10 tracking-wide">
            The Culinary Preparation
          </div>
          <div className="pt-4 text-white/60 text-[10px] font-bold uppercase tracking-[4px]">
            A Film by Au Lac
          </div>
        </div>

        <div className="absolute right-16 bottom-16 flex gap-12">
          <div className="text-right">
            <div className="text-white/40 text-[8px] font-bold uppercase tracking-wide">
              Duration
            </div>
            <div className="text-white/40 text-sm leading-5">02:45 MIN</div>
          </div>
          <div className="text-right">
            <div className="text-white/40 text-[8px] font-bold uppercase tracking-wide">
              Resolution
            </div>
            <div className="text-white/40 text-sm leading-5">4K CINEMATIC</div>
          </div>
        </div>
      </div>
    </section>
  );
}
