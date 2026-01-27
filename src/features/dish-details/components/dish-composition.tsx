"use client";

type CompositionItem = {
  title: string;
  sub: string;
  desc: string;
  img: string;
};

const COMPOSITION: CompositionItem[] = [
  {
    title: "Rice Vermicelli",
    sub: "Hue Style",
    desc: "Thick, cylindrical rice noodles with a satisfying chew, traditional to Central Vietnam.",
    img: "/images/dish-detail/dish-composition-rice/dish-compostion-rice.png",
  },
  {
    title: "Imperial Lemongrass",
    sub: "Mekong Delta",
    desc: "Freshly harvested stalks that impart the signature citrus-floral aroma to the broth.",
    img: "/images/dish-detail/dish-composition-imperial/dish-compostion-imperial.png",
  },
  {
    title: "Mam Ruoc",
    sub: "Fermented Shrimp Paste",
    desc: "A traditional condiment that provides the essential umami foundation of the dish.",
    img: "/images/dish-detail/dish-composition-mam-ruoc/dish-composition-mam-ruoc.png",
  },
];

export function DishComposition() {
  return (
    <aside className="border-l border-slate-200 pl-0 lg:pl-8">
      <div className="text-sm font-bold uppercase tracking-[2.80px] text-blue-800">
        The Composition
      </div>

      {COMPOSITION.map((it) => (
        <div key={it.title} className="mt-10 flex gap-6">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-gray-100 md:h-28 md:w-28">
            <img src={it.img} alt={it.title} className="h-full w-full object-cover" />
          </div>

          <div className="pt-1">
            <div className="text-[22px] font-bold leading-7 text-neutral-900">
              {it.title}
            </div>
            <div className="mt-2 text-xs font-bold uppercase tracking-[2px] text-blue-800">
              {it.sub}
            </div>
            <p className="mt-3 text-[15px] leading-6 text-gray-500">
              {it.desc}
            </p>
          </div>
        </div>
      ))}

      {/* Stats */}
      <div className="mt-12 border-t border-slate-200 pt-8">
        <div className="grid grid-cols-2 gap-x-10 gap-y-6">
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Preparation
            </div>
            <div className="mt-1 text-base font-medium text-neutral-900">
              12 Hours
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Calories
            </div>
            <div className="mt-1 text-base font-medium text-neutral-900">
              580 kcal
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Allergens
            </div>
            <div className="mt-1 text-base font-medium text-neutral-900">
              Shellfish
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Spice Level
            </div>
            <div className="mt-1 text-base font-medium text-orange-600">
              Medium-High
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
