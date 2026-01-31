"use client";

import { useTranslations } from "next-intl";

type DishHeroProps = {
  onOrderNow: () => void;
};

export function DishHero({ onOrderNow }: DishHeroProps) {
  const t = useTranslations("DishDetails.Hero");

  return (
    <section className="mx-auto w-full max-w-[1200px] px-3 pt-6 md:px-4 md:pt-10">
      <div className="relative h-[500px] overflow-hidden rounded-xl shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.10)] shadow-xl md:h-[561px] md:rounded-2xl">
        <img
          src= "/images/dish-detail/dish-hero/dish-hero.png"
          alt="Dish hero"
          className="absolute left-0 top-[-140px] h-[900px] w-full object-cover md:top-[-460px] md:h-[1045px]"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/20 to-black/0" />

        {/* Tag */}
        <div className="absolute left-4 top-6 rounded-full bg-blue-800/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-[2px] md:left-16 md:top-[200px] md:px-4 md:py-1.5 md:text-xs">
          {t("tag")}
        </div>

        {/* Title */}
        <h1 className="absolute left-4 top-16 max-w-[350px] text-3xl font-medium leading-[36px] text-white md:left-16 md:top-[240px] md:max-w-[620px] md:text-7xl md:leading-[76px]">
          <span className="block">{t("title_line_1")}</span>
          <span className="block">{t("title_line_2")}</span>
        </h1>

        {/* Subtitle */}
        <p className="absolute left-4 top-[155px] max-w-[380px] text-sm font-light leading-5 text-white/90 md:left-16 md:top-[400px] md:max-w-[520px] md:text-xl md:leading-7">
          {t.rich("subtitle", { br: () => <br /> })}
        </p>

        {/* Buttons */}
        <div className="absolute left-4 top-[235px] flex flex-col gap-2.5 md:left-16 md:top-[488px] md:flex-row md:gap-3">
          <button
            type="button"
            className="h-11 w-full rounded-lg bg-white shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.10)] shadow-lg md:h-12 md:w-60"
          >
            <span className="text-sm font-bold text-blue-800 md:text-base">
              {t("reserve")}
            </span>
          </button>

          <button
            type="button"
            className="h-11 w-full rounded-lg bg-black/40 outline outline-1 outline-offset-[-1px] outline-white/20 backdrop-blur-[6px] md:h-12 md:w-32"
          >
            <span className="text-sm font-medium text-white md:text-base">{t("share")}</span>
          </button>
        </div>

        {/* Order Now */}
        <button
          type="button"
          className="absolute bottom-4 right-4 h-10 w-24 rounded-lg bg-amber-400 md:right-[150px] md:top-[492px] md:bottom-auto md:h-11 md:w-28"
          onClick={onOrderNow}
        >
          <span className="text-xs font-medium text-blue-950 md:text-sm">{t("order_now")}</span>
        </button>

        {/* Photo / 360 / Video pill (UI only) */}
        <div className="absolute left-1/2 top-4 hidden -translate-x-1/2 items-center gap-2 rounded-full bg-black/30 p-1.5 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-md md:inline-flex">
          <button
            type="button"
            className="rounded-full bg-white/20 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white outline outline-1 outline-offset-[-1px] outline-white/20 shadow-lg"
          >
            {t("photo")}
          </button>
          <button
            type="button"
            className="rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white/70"
          >
            {t("view_360")}
          </button>
          <button
            type="button"
            className="rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white/70"
          >
            {t("video")}
          </button>
        </div>
      </div>
    </section>
  );
}
