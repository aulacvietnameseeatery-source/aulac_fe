"use client";

export default function AboutJourney() {
  return (
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
          envisioned as a bridge between the ancient traditions of the East and
          the refined techniques of contemporary gastronomy.
        </p>

        <p>
          For three decades, we have remained committed to the "trầm ấm"
          philosophy—creating a warm, soul-stirring atmosphere where every dish
          tells a story of heritage. What started with a single family recipe for
          Pho has evolved into an editorial dining experience that honors the
          seasonal rhythm of our land.
        </p>

        <div className="border-l-2 border-orange-300 py-4 pl-8">
          <p className="text-blue-950 text-2xl font-normal leading-8">
            "We do not just serve food; we preserve the echoes of a thousand years
            of culinary evolution."
          </p>
        </div>

        <p>
          Today, Au Lac stands as a beacon of Vietnamese fine dining, where the
          crackle of a clay pot and the aroma of star anise serve as a homecoming
          for the senses.
        </p>
      </div>
    </section>
  );
}
