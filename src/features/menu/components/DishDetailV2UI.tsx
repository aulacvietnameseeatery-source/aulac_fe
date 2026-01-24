"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import OrderSuccessPopup from "./OrderSuccessPopup";

export default function DishDetailV2UI() {
  const [openPopup, setOpenPopup] = useState(false);

  // optional: khóa scroll khi mở popup
  useEffect(() => {
    document.body.style.overflow = openPopup ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [openPopup]);

  return (
    <main className="w-full bg-white">
      {/* Section A: Hero 360 experience (black) */}
      <section className="relative w-full bg-black overflow-hidden">
        <div className="relative h-[1153px] w-full">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgo956qb9QNTgiQSGvSpEz6UPfwhX05ZQP4QKI16u8Z5dZr8hYlgkog3rODfpahCRNev1n5e4n00eijrvP7spWdCe_q5TIxiwA14pQoz9wrBl8HiTsBNdMir--2V7IbHuMhG4t6qEzAvQya_e11Ej56qTC-t08VdoOtE9mHcWFcSepU48W50Me-cyGm-9Rc-dAQBbrZFhcCBOc81JOj0HYMGlpDKpx4Bmpj6miNLH3XMtv_xUf5Dtio6W0waKKKDkCNfqZiLKOvJM"
            alt="Dish hero"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/0 to-black/20" />

          {/* ✅ Order Now button (mở popup) */}
        {/* ✅ Order Now button (giống vị trí version 1) */}
<button
  type="button"
  onClick={() => setOpenPopup(true)}
  className="absolute bottom-6 right-6 z-10 h-11 w-28 rounded-lg bg-amber-400 shadow-lg md:right-[150px] md:top-[492px] md:bottom-auto"
>
  <span className="text-blue-950 text-sm font-medium">
    Order Now
  </span>
</button>


          {/* Center badge */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-black/20 px-10 pt-8 pb-10 backdrop-blur-sm outline outline-1 outline-white/10 flex flex-col items-center gap-2.5">
              <div className="text-white text-3xl">⟲</div>
              <div className="text-white/80 text-[10px] font-bold uppercase tracking-[5px]">
                Hold & Rotate View
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

      {/* Section B: Narrative */}
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
                  complexity of Central Vietnam, offering a profile far more
                  robust than its northern counterpart, Pho.
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

      {/* Section C: Cinematic image (slate-900) */}
      <section className="relative w-full bg-slate-900">
        <div className="relative h-[823px] w-full overflow-hidden">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvT2B3gQAASrDRgXSwxD7d00IFFW-OGUcUZ-f6AagG53Bb_cRWPimUzUmKd2ItZ8H1mYErDnWTFj1I8pGfVZRQasZFjg6a9rV9WIXTlGR7arzAT7GdDxXgNGkuZveOHeJGAl8OXSwg521I3RI9OYGYeoLxJ2wg9KZtrJt7AiBmyKH2m55lrS0TNu7o_fTa8KA3wj5BfGVpSK4qeehW8ShZCv1G7N6DKR8MPcC78RB9RkZo7qqxLudahAM2OdEZsvccX1nWfWwRo9I"
            alt="Cinematic dish detail"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/0 to-slate-900/0" />

          <div className="absolute left-16 bottom-16 max-w-[512px] space-y-4">
            <div className="text-orange-300 text-[10px] font-bold uppercase tracking-[4px]">
              Perspective 02
            </div>
            <div className="text-white text-4xl font-[var(--font-playfair)] leading-10">
              The Art of the Broth
            </div>
            <p className="text-white/60 text-sm leading-6 tracking-tight">
              A visual study of the twelve-hour simmered lemongrass essence,
              captured at the moment of peak flavor extraction.
            </p>
          </div>
        </div>
      </section>

      {/* Section D: Video placeholder */}
      <section className="relative w-full bg-black">
        <div className="relative h-[1200px] w-full overflow-hidden">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4KTXmZ2HyMDlPXvLJy8boOgnuriCz8qKCaDb6q4Ue1qnuBHrlNToLWdsqDAPVlA8NF9MQ5Moy9zCcQ2rADr2JttAbRVyeEMAlUOvuqoHaHRT-5-gjdWObVzkUZWxDMQ2mLQh2YeztiEzmm3hqppXdwmxvkbGZRsfb0jU1Tr4Z4vEzKhkEawMzDNSeNmbp-hTSYBME7botQ8ijf4t397KslIR1AOqJ4a42AGpr56dxEme-u7hFWykZmGFBi9fm2d-euQaKnd3Ijos"
            alt="Video placeholder"
            fill
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-blue-950/20" />

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="flex h-32 w-32 items-center justify-center rounded-full outline outline-1 outline-white/30">
              <div className="text-white text-4xl">▶</div>
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

      {/* Section E: Composition (stone-100 container) */}
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
              {[
                {
                  title: "Rice Vermicelli",
                  tag: "Hue Tradition",
                  num: "01",
                  img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBef2Xhx5WRXso44OWwI5vn5UzU0UEK-t2OqzomrfVjZE-pT7zr7-6YswGb3_F0MlqNsVQKx8_khy8bLJ-09O1wopOM9OYgzO1OxTBn5Q6rXGwD1qO89zPnuyTwYZ9ovViioTB11KFaxg21Yy9il1a9mHWv01ZGP_6k7FuVZP_DPMHDdbDpMs3w1aoboLU_2SQ-Qja1Yrpni1d1lscHq3IiLRVdEm0dAi2BQB_9uS0BocjAn1CFXrWZnrHxGiD70lnipR4s6v-FcXk",
                  desc:
                    "Thick, cylindrical rice noodles with a satisfying chew, custom-crafted to carry the robust weight of our imperial broth.",
                },
                {
                  title: "Mekong Lemongrass",
                  tag: "Aromatic Base",
                  num: "02",
                  img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAdH28F7whTF2xzEPACKOfhh8XzvFz01a4le0DzxjnibnJ5Qf0OooUnfZaLfSTjAxwduNWKojAoi2Djx6IuEczUG77xekB1ShDYq214iiDypyVwhfn6UBhDiDreY99-_BBxijRQ919cUPHVxyWC91KOkD5OZ-pUf273bRlEV35lahWJFy34mg55jot57c5m-uaQQe7uIqZoqLMkF8zMaPT8ekmXZ4I0IMdA2t0Yjt_sB7sFb1FLE1JRPSOc8X8XcR56EQuoKISfj7Q",
                  desc:
                    "Freshly harvested stalks that impart the signature citrus-floral aroma, bruised by hand to release essential oils into the simmer.",
                },
                {
                  title: "Mam Ruoc",
                  tag: "Deep Umami",
                  num: "03",
                  img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA4KTXmZ2HyMDlPXvLJy8boOgnuriCz8qKCaDb6q4Ue1qnuBHrlNToLWdsqDAPVlA8NF9MQ5Moy9zCcQ2rADr2JttAbRVyeEMAlUOvuqoHaHRT-5-gjdWObVzkUZWxDMQ2mLQh2YeztiEzmm3hqppXdwmxvkbGZRsfb0jU1Tr4Z4vEzKhkEawMzDNSeNmbp-hTSYBME7botQ8ijf4t397KslIR1AOqJ4a42AGpr56dxEme-u7hFWykZmGFBi9fm2d-euQaKnd3Ijos",
                  desc:
                    "A rare, fermented shrimp paste sourced from coastal Hue, providing the essential, deeply layered foundation of the dish.",
                },
              ].map((x) => (
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
              {[
                ["Curing Time", "12 Hours"],
                ["Caloric Value", "580 kcal"],
                ["Spice Quotient", "High Intensity"],
                ["Allergens", "Shellfish"],
              ].map(([k, v]) => (
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

      {/* Section F: CTA */}
      <section className="w-full bg-blue-950 py-32">
        <div className="mx-auto max-w-[1400px] px-6 text-center space-y-12">
          <h4 className="text-white text-6xl md:text-7xl font-[var(--font-playfair)] leading-[1.05]">
            Experience the tradition.
          </h4>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-sm bg-orange-300 px-16 py-5 shadow-2xl"
            onClick={() => setOpenPopup(true)} //  CTA cũng mở popup 
          >
            <span className="text-blue-950 text-xs font-bold uppercase tracking-[3.6px]">
              Reserve Your Experience
            </span>
          </button>
        </div>
      </section>

      {/*  Popup */}
      <OrderSuccessPopup open={openPopup} onClose={() => setOpenPopup(false)} />
    </main>
  );
}
