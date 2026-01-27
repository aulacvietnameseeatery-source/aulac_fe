"use client";

export function DishNarrative() {
  return (
    <div>
      <div className="border-b border-blue-800/20 pb-2">
        <div className="text-sm font-bold uppercase tracking-[2.80px] text-blue-800">
          The Narrative
        </div>
      </div>

      <h2 className="mt-6 text-3xl leading-9 text-neutral-900 md:text-4xl md:leading-10">
        Where imperial tradition meets modern
        <br />
        refinement.
      </h2>

      <div className="mt-6 text-lg leading-7 text-gray-600">
        <span className="mr-2 inline-block align-top text-2xl">D</span>
        erived from the royal court cuisine of the Nguyen Dynasty, this
        dish—known as Bun Bo Hue—is a harmonious blend of spicy, sour,
        salty, and sweet. It stands as a testament to the culinary
        complexity of Central Vietnam, offering a profile far more robust
        than its northern counterpart, Pho.
      </div>

      <p className="mt-6 text-lg leading-7 text-gray-600">
        The soul of the dish lies in its broth. We simmer premium beef
        shanks and pork knuckles for twelve hours with crushed lemongrass
        stalks and a hint of fermented shrimp paste. This meticulous
        process extracts deep umami notes while maintaining a clarity that
        is characteristic of high-end Vietnamese gastronomy.
      </p>

      <p className="mt-6 text-lg leading-7 text-gray-600">
        Served with thick, cylindrical rice vermicelli and finished with
        our house-made chili saté, each bowl is a tribute to the Perfume
        River&apos;s misty mornings. It is not just soup; it is history
        poured into porcelain.
      </p>

      {/* Pairing card */}
      <div className="relative mt-10 overflow-hidden rounded-xl bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] outline-slate-200">
        <div className="p-6 md:p-8">
          <div className="flex items-start gap-5">
            <div className="relative h-24 w-24 overflow-hidden rounded-full bg-gray-100 outline outline-2 outline-offset-[-2px] outline-blue-800/20">
              <img
                src= "/images/dish-detail/dish-narrative/dish-narrative.png"
                alt="Pairing"
                className="h-full w-full object-cover opacity-90"
              />
            </div>

            <div className="flex-1">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-800">
                Sommelier&apos;s Pairing
              </div>
              <div className="mt-1 text-xl font-bold leading-7 text-neutral-900">
                2018 Grand Cru Riesling
              </div>
              <p className="mt-3 text-sm leading-5 text-gray-500">
                &quot;The crisp acidity and mineral notes of this Alsatian
                Riesling cut through the rich, spicy broth, cleansing the
                palate while complementing the lemongrass aromatics.&quot;
              </p>
            </div>

            <button
              type="button"
              className="h-9 w-32 rounded-lg outline outline-1 outline-offset-[-1px] outline-blue-800"
            >
              <span className="text-sm font-bold text-blue-800">Add to Order</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
