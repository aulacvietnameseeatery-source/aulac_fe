"use client";

export default function AboutUsUI() {
  return (
    <div className="w-full bg-stone-100">
      {/* Breadcrumb bar (bỏ header/footer) */}
      <div className="sticky top-0 z-10 w-full border-b border-stone-200 bg-stone-100/80 backdrop-blur-sm">
        <div className="mx-auto flex h-20 w-full max-w-[1232px] items-center px-4">
          <div className="flex items-center gap-3 text-sm font-medium text-neutral-950">
            <span>Home</span>
            <span className="opacity-60">-&gt;</span>
            <span>About Us</span>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <main className="mx-auto w-full max-w-[1200px] px-4 pb-20 pt-16 md:pt-32">
        <div className="flex flex-col items-center gap-24">
          {/* SECTION 1: Our Legacy */}
          <section className="w-full max-w-[1152px] px-6">
            <div className="flex flex-col items-center gap-4">
              <div className="text-center text-orange-300 text-xs font-bold uppercase tracking-[4.40px]">
                Est. 1994
              </div>

              <h2 className="text-center text-blue-950 text-5xl font-bold leading-[52px] md:text-7xl md:leading-[72px]">
                Our Legacy
              </h2>

              <div className="h-px w-16 bg-orange-300" />
            </div>

            <div className="mt-12 overflow-hidden rounded-sm shadow-2xl">
              <div className="relative h-[260px] md:h-[473px]">
                <img
                  src="https://placehold.co/1104x473"
                  alt="Au Lac Interior"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-blue-950/20" />
              </div>
            </div>
          </section>

          {/* SECTION 2: The Journey of Flavor */}
          <section className="relative w-full max-w-[848px] rounded-sm bg-white p-10 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] outline-blue-950/5 md:p-20">
            {/* icon placeholder */}
            <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-stone-100 px-6 py-1.5">
              <div className="h-11 w-9 bg-orange-300/80 rounded-sm" />
            </div>

            <h3 className="text-center text-blue-950 text-3xl font-bold leading-9">
              The Journey of Flavor
            </h3>

            <div className="mt-10 flex flex-col gap-8 text-lg leading-7 text-blue-950/80">
              <p>
                Founded in the heart of the capital in 1994,{" "}
                <span className="font-bold text-blue-950">Au Lac</span> began as a
                humble tribute to the ancestral roots of Vietnamese cuisine. Named
                after the historic kingdom of the Lac Viet people, our eatery was
                envisioned as a bridge between the ancient traditions of the East
                and the refined techniques of contemporary gastronomy.
              </p>

              <p>
                For three decades, we have remained committed to the "trầm ấm"
                philosophy—creating a warm, soul-stirring atmosphere where every
                dish tells a story of heritage. What started with a single family
                recipe for Pho has evolved into an editorial dining experience that
                honors the seasonal rhythm of our land.
              </p>

              <div className="border-l-2 border-orange-300 py-4 pl-8">
                <p className="text-blue-950 text-2xl font-normal leading-8">
                  "We do not just serve food; we preserve the echoes of a thousand
                  years of culinary evolution."
                </p>
              </div>

              <p>
                Today, Au Lac stands as a beacon of Vietnamese fine dining, where
                the crackle of a clay pot and the aroma of star anise serve as a
                homecoming for the senses.
              </p>
            </div>
          </section>

          {/* SECTION 3: Culinary Philosophy */}
          <section className="w-full max-w-[1152px] px-6 pt-8">
            <div className="flex flex-col items-center">
              <div className="text-center text-orange-300 text-xs font-bold uppercase tracking-[3.30px]">
                Our Core Values
              </div>
              <div className="mt-3 text-center text-blue-950 text-4xl font-bold leading-10">
                Culinary Philosophy
              </div>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-2">
              <div className="relative rounded-sm bg-blue-950/5 p-10 outline outline-2 outline-offset-[-2px] outline-black/0">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
                  <div className="h-10 w-10 rounded bg-blue-950/80" />
                </div>
                <div className="mt-10 text-center text-blue-950 text-2xl font-bold leading-8">
                  Traditional Craft
                </div>
                <p className="mt-4 text-center text-blue-950/60 text-base leading-6">
                  Honoring the slow techniques of our ancestors. From 24-hour bone
                  broths to hand-ground spices using the mortar and pestle.
                </p>
              </div>

              <div className="relative rounded-sm bg-blue-950/5 p-10 outline outline-2 outline-offset-[-2px] outline-black/0">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
                  <div className="h-10 w-10 rounded bg-blue-950/80" />
                </div>
                <div className="mt-10 text-center text-blue-950 text-2xl font-bold leading-8">
                  Modern Spirit
                </div>
                <p className="mt-4 text-center text-blue-950/60 text-base leading-6">
                  Elevating heritage flavors through precision, artistic plating,
                  and a sophisticated global perspective on fine dining.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 4: Meet the Founders */}
          <section className="w-full max-w-[976px] overflow-hidden rounded-sm bg-white pt-8 shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.10)] shadow-xl outline outline-1 outline-offset-[-1px] outline-blue-950/5 md:grid md:grid-cols-2">
            <div className="h-[300px] bg-blue-950/10 md:h-[500px]">
              <div className="h-full w-full bg-[linear-gradient(120deg,rgba(2,6,23,0.15),rgba(2,6,23,0.05))]" />
            </div>

            <div className="p-8 md:p-16">
              <div className="text-orange-300 text-xs font-bold uppercase tracking-[3.30px]">
                The Visionaries
              </div>

              <div className="mt-3 text-blue-950 text-3xl font-bold leading-9">
                Meet the Founders
              </div>

              <div className="mt-6 flex flex-col gap-6 text-blue-950/70 text-base leading-6">
                <p>
                  Chef Nguyen and Master Sommelier Linh founded Au Lac with a
                  shared dream: to redefine how the world perceives Vietnamese
                  hospitality.
                </p>

                <p>
                  With backgrounds spanning from the street stalls of Saigon to
                  Michelin-starred kitchens in Paris, they bring a balanced harmony
                  of warmth and professional excellence to every guest&apos;s table.
                </p>
              </div>

              <div className="mt-10 border-t border-blue-950/10 pt-10">
                <p className="text-blue-950 text-lg leading-7">
                  "The table is where culture lives. We invite you to sit with us."
                </p>
                <p className="mt-4 text-orange-300 text-[10px] font-bold uppercase tracking-widest">
                  — Nguyen &amp; Linh
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
