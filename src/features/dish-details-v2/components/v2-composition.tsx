"use client";

import Image from "next/image";

type Item = {
  title: string;
  tag: string;
  num: string;
  img: string;
  desc: string;
};

const ITEMS: Item[] = [
  {
    title: "Rice Vermicelli",
    tag: "Hue Tradition",
    num: "01",
    img: "/images/dish-detail-v2/v2-composition-rice/v2-composition-rice.png",
    desc: "Thick, cylindrical rice noodles with a satisfying chew, custom-crafted to carry the robust weight of our imperial broth.",
  },
  {
    title: "Mekong Lemongrass",
    tag: "Aromatic Base",
    num: "02",
    img: "/images/dish-detail-v2/v2-composition-mekong/v2-composition-mekong.png",
    desc: "Freshly harvested stalks that impart the signature citrus-floral aroma, bruised by hand to release essential oils into the simmer.",
  },
  {
    title: "Mam Ruoc",
    tag: "Deep Umami",
    num: "03",
    img: "/images/dish-detail-v2/v2-composition-mam-ruoc/v2-composition-mam-ruoc.png",
    desc: "A rare, fermented shrimp paste sourced from coastal Hue, providing the essential, deeply layered foundation of the dish.",
  },
];

const STATS: Array<[string, string]> = [
  ["Curing Time", "12 Hours"],
  ["Caloric Value", "580 kcal"],
  ["Spice Quotient", "High Intensity"],
  ["Allergens", "Shellfish"],
];

export function V2Composition() {
  return (
    <section className="w-full bg-white py-32">
      <div className="mx-auto w-full max-w-[1400px] px-6">
        <div className="bg-stone-100 px-6 py-32">
          <div className="text-center">
            <div className="text-orange-300 text-xs font-extrabold uppercase tracking-[6px]">
              Foundation
            </div>
            <h3 className="mt-4 text-blue-950 text-5xl font-[var(--font-playfair)] leading-[48px]">
              The Composition
            </h3>
            <div className="mx-auto mt-8 h-12 w-px bg-orange-300/40" />
          </div>

          <div className="mt-24 grid grid-cols-1 gap-px bg-blue-950/10 outline outline-1 outline-blue-950/10 md:grid-cols-3">
            {ITEMS.map((x) => (
              <div key={x.num} className="bg-stone-100 p-12">
                <div className="relative h-96 w-full overflow-hidden rounded-xl bg-white">
                  <Image src={x.img} alt={x.title} fill className="object-cover" />
                </div>

                <div className="mt-10 flex items-start justify-between">
                  <div>
                    <div className="text-blue-950 text-2xl font-[var(--font-playfair)] leading-8">
                      {x.title}
                    </div>
                    <div className="mt-3 text-orange-300 text-[9px] font-extrabold uppercase tracking-[2.7px]">
                      {x.tag}
                    </div>
                  </div>
                  <div className="text-blue-950/20 text-4xl font-[var(--font-playfair)] leading-10">
                    {x.num}
                  </div>
                </div>

                <p className="mt-8 text-blue-950/60 text-sm leading-6 font-[var(--font-inter)]">
                  {x.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 grid grid-cols-2 gap-12 border-t border-blue-950/5 pt-16 md:grid-cols-4">
            {STATS.map(([k, v]) => (
              <div key={k} className="text-center">
                <div className="text-blue-950/40 text-[9px] font-extrabold uppercase tracking-[2.7px]">
                  {k}
                </div>
                <div className="mt-2 text-blue-950 text-xl font-[var(--font-playfair)] leading-7">
                  {v}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
