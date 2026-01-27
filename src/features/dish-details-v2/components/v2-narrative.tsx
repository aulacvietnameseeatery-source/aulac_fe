"use client";

export function V2Narrative() {
  return (
    <section className="w-full bg-white py-32">
      <div className="mx-auto w-full max-w-[1400px] px-6">
        <div className="grid grid-cols-1 gap-20 lg:grid-cols-2">
          {/* Left */}
          <div className="max-w-md">
            <div className="inline-flex border border-orange-300 px-4 py-1.5">
              <span className="text-orange-300 text-[10px] font-extrabold uppercase tracking-[3px]">
                Chef&apos;s Signature Selection
              </span>
            </div>

            <h2 className="mt-8 text-blue-950 text-6xl lg:text-7xl font-medium leading-[1.05] font-[var(--font-playfair)]">
              Imperial
              <br />
              Hue
              <br />
              Beef
              <br />
              Noodle
              <br />
              Soup
            </h2>

            <div className="mt-8 flex items-center gap-4">
              <div className="h-px w-12 bg-orange-300" />
              <div className="text-blue-950/40 text-[10px] font-bold uppercase tracking-[3px]">
                Est. 1802 Nguyen Dynasty
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-10 text-blue-950/80 text-xl lg:text-2xl leading-10 font-[var(--font-playfair)]">
            <div className="relative">
              <span className="absolute -left-2 top-0 text-2xl">D</span>
              <p className="pl-10">
                erived from the royal court cuisine of the Nguyen Dynasty, this
                dish—known as Bun Bo Hue—is a harmonious blend of spicy, sour,
                salty, and sweet. It stands as a testament to the culinary
                complexity of Central Vietnam, offering a profile far more robust
                than its northern counterpart, Pho.
              </p>
            </div>

            <p>
              The soul of the dish lies in its broth. We simmer premium beef
              shanks and pork knuckles for twelve hours with crushed lemongrass
              stalks and a hint of fermented shrimp paste. This meticulous
              process extracts deep umami notes while maintaining a clarity
              that is characteristic of high-end Vietnamese gastronomy.
            </p>

            <div className="border-l-4 border-orange-300/30 pl-8 py-2 text-blue-950/60">
              Served with thick, cylindrical rice vermicelli and finished with
              our house-made chili saté, each bowl is a tribute to the Perfume
              River&apos;s misty mornings. It is not just soup; it is history
              poured into porcelain.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
