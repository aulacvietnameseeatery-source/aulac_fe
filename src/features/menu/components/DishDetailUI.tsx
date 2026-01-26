"use client";

import { useEffect, useState } from "react";
import OrderSuccessPopup from "./OrderSuccessPopup";

export default function DishDetailUI() {
  const [openPopup, setOpenPopup] = useState(false);

  // (optional) khóa scroll khi mở popup
  useEffect(() => {
    if (openPopup) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [openPopup]);

  return (
    <div className="w-full bg-stone-50">
      {/* Breadcrumb bar (bỏ header/footer) */}
      <div className="sticky top-0 z-10 w-full border-b border-stone-200 bg-stone-50/80 backdrop-blur-sm">
        <div className="mx-auto flex h-20 w-full max-w-[1232px] items-center px-4">
          <div className="flex items-center gap-3 text-sm font-medium text-neutral-950">
            <span>Home</span>
            <span className="opacity-60">-&gt;</span>
            <span>Menu</span>
            <span className="opacity-60">-&gt;</span>
            <span>Name_Dish_Details</span>
          </div>
        </div>
      </div>

      {/* HERO IMAGE SECTION */}
      <section className="mx-auto w-full max-w-[1200px] px-4 pt-10">
        <div className="relative h-[360px] overflow-hidden rounded-2xl shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.10)] shadow-xl md:h-[561px]">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgo956qb9QNTgiQSGvSpEz6UPfwhX05ZQP4QKI16u8Z5dZr8hYlgkog3rODfpahCRNev1n5e4n00eijrvP7spWdCe_q5TIxiwA14pQoz9wrBl8HiTsBNdMir--2V7IbHuMhG4t6qEzAvQya_e11Ej56qTC-t08VdoOtE9mHcWFcSepU48W50Me-cyGm-9Rc-dAQBbrZFhcCBOc81JOj0HYMGlpDKpx4Bmpj6miNLH3XMtv_xUf5Dtio6W0waKKKDkCNfqZiLKOvJM"
            alt="Dish hero"
            className="absolute left-0 top-[-140px] h-[900px] w-full object-cover md:top-[-460px] md:h-[1045px]"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/20 to-black/0" />

          {/* Tag */}
          <div className="absolute left-6 top-10 rounded-full bg-blue-800/80 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-[2px] md:left-16 md:top-[200px]">
            Chef&apos;s Masterpiece
          </div>

          {/* Title */}
          <h1 className="absolute left-6 top-20 max-w-[620px] text-4xl font-medium leading-[44px] text-white md:left-16 md:top-[240px] md:text-7xl md:leading-[76px]">
  <span className="block">
    Imperial Hue
  </span>
  <span className="block">
    Beef Noodle Soup
  </span>
</h1>


          {/* Subtitle */}
          <p className="absolute left-6 top-[190px] max-w-[520px] text-base font-light leading-6 text-white/90 md:left-16 md:top-[400px] md:text-xl md:leading-7">
            A culinary voyage to the Imperial City of Hue, balancing
            <br />
            boldness and refinement in a single bowl.
          </p>

          {/* Buttons */}
          <div className="absolute left-6 top-[265px] flex flex-wrap gap-3 md:left-16 md:top-[488px]">
            <button
              type="button"
              className="h-12 w-60 rounded-lg bg-white shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.10)] shadow-lg"
            >
              <span className="text-base font-bold text-blue-800">
                Reserve Experience
              </span>
            </button>

            <button
              type="button"
              className="h-12 w-32 rounded-lg bg-black/40 outline outline-1 outline-offset-[-1px] outline-white/20 backdrop-blur-[6px]"
            >
              <span className="text-base font-medium text-white">Share</span>
            </button>
          </div>

          {/* Order Now */}
          <button
            type="button"
            className="absolute bottom-6 right-6 h-11 w-28 rounded-lg bg-amber-400 md:right-[150px] md:top-[492px] md:bottom-auto"
            onClick={() => setOpenPopup(true)}
          >
            <span className="text-sm font-medium text-blue-950">Order Now</span>
          </button>

          {/* Photo / 360 / Video pill (UI only) */}
          <div className="absolute left-1/2 top-4 hidden -translate-x-1/2 items-center gap-2 rounded-full bg-black/30 p-1.5 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-md md:inline-flex">
            <button
              type="button"
              className="rounded-full bg-white/20 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white outline outline-1 outline-offset-[-1px] outline-white/20 shadow-lg"
            >
              Photo
            </button>
            <button
              type="button"
              className="rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white/70"
            >
              360° View
            </button>
            <button
              type="button"
              className="rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white/70"
            >
              Video
            </button>
          </div>
        </div>
      </section>

      {/* CONTENT SECTION */}
      <section className="mx-auto w-full max-w-[1200px] px-4 pb-20 pt-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
          {/* LEFT: Narrative */}
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
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvT2B3gQAASrDRgXSwxD7d00IFFW-OGUcUZ-f6AagG53Bb_cRWPimUzUmKd2ItZ8H1mYErDnWTFj1I8pGfVZRQasZFjg6a9rV9WIXTlGR7arzAT7GdDxXgNGkuZveOHeJGAl8OXSwg521I3RI9OYGYeoLxJ2wg9KZtrJt7AiBmyKH2m55lrS0TNu7o_fTa8KA3wj5BfGVpSK4qeehW8ShZCv1G7N6DKR8MPcC78RB9RkZo7qqxLudahAM2OdEZsvccX1nWfWwRo9I"
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
                    <span className="text-sm font-bold text-blue-800">
                      Add to Order
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Composition */}
          <aside className="border-l border-slate-200 pl-0 lg:pl-8">
            <div className="text-sm font-bold uppercase tracking-[2.80px] text-blue-800">
              The Composition
            </div>

            {/* NOTE:
                Figma thumbnail lớn hơn => đổi từ h-16 w-16 -> h-24 w-24 (md: h-28 w-28)
                + tăng gap, padding, line-height cho giống design
            */}
            {[
              {
                title: "Rice Vermicelli",
                sub: "Hue Style",
                desc:
                  "Thick, cylindrical rice noodles with a satisfying chew, traditional to Central Vietnam.",
                img:
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuBef2Xhx5WRXso44OWwI5vn5UzU0UEK-t2OqzomrfVjZE-pT7zr7-6YswGb3_F0MlqNsVQKx8_khy8bLJ-09O1wopOM9OYgzO1OxTBn5Q6rXGwD1qO89zPnuyTwYZ9ovViioTB11KFaxg21Yy9il1a9mHWv01ZGP_6k7FuVZP_DPMHDdbDpMs3w1aoboLU_2SQ-Qja1Yrpni1d1lscHq3IiLRVdEm0dAi2BQB_9uS0BocjAn1CFXrWZnrHxGiD70lnipR4s6v-FcXk",
              },
              {
                title: "Imperial Lemongrass",
                sub: "Mekong Delta",
                desc:
                  "Freshly harvested stalks that impart the signature citrus-floral aroma to the broth.",
                img:
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuAdH28F7whTF2xzEPACKOfhh8XzvFz01a4le0DzxjnibnJ5Qf0OooUnfZaLfSTjAxwduNWKojAoi2Djx6IuEczUG77xekB1ShDYq214iiDypyVwhfn6UBhDiDreY99-_BBxijRQ919cUPHVxyWC91KOkD5OZ-pUf273bRlEV35lahWJFy34mg55jot57c5m-uaQQe7uIqZoqLMkF8zMaPT8ekmXZ4I0IMdA2t0Yjt_sB7sFb1FLE1JRPSOc8X8XcR56EQuoKISfj7Q",
              },
              {
                title: "Mam Ruoc",
                sub: "Fermented Shrimp Paste",
                desc:
                  "A traditional condiment that provides the essential umami foundation of the dish.",
                img:
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuA4KTXmZ2HyMDlPXvLJy8boOgnuriCz8qKCaDb6q4Ue1qnuBHrlNToLWdsqDAPVlA8NF9MQ5Moy9zCcQ2rADr2JttAbRVyeEMAlUOvuqoHaHRT-5-gjdWObVzkUZWxDMQ2mLQh2YeztiEzmm3hqppXdwmxvkbGZRsfb0jU1Tr4Z4vEzKhkEawMzDNSeNmbp-hTSYBME7botQ8ijf4t397KslIR1AOqJ4a42AGpr56dxEme-u7hFWykZmGFBi9fm2d-euQaKnd3Ijos",
              },
            ].map((it) => (
              <div key={it.title} className="mt-10 flex gap-6">
                {/* Thumbnail bigger like Figma */}
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-gray-100 md:h-28 md:w-28">
                  <img
                    src={it.img}
                    alt={it.title}
                    className="h-full w-full object-cover"
                  />
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
        </div>
      </section>

      {/* POPUP */}
      <OrderSuccessPopup open={openPopup} onClose={() => setOpenPopup(false)} />
    </div>
  );
}
