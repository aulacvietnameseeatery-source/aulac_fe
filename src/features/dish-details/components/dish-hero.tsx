"use client";

import { useTranslations } from "next-intl";
import { Dish } from "../types";

type DishHeroProps = {
  dish: Dish;
  onOrderNow: () => void;
};

export function DishHero({ dish, onOrderNow }: DishHeroProps) {
  const t = useTranslations("DishDetails.Hero");
  
  // Temporarily use fixed image (imageUrls from API available but not used yet)
  const heroImage = "/images/dish-detail/dish-hero/dish-hero.png";

  return (
    <section className="mx-auto w-full max-w-[1200px] overflow-hidden px-0 pt-6 md:px-4 md:pt-10">
      <div className="relative h-[580px] overflow-hidden rounded-none shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.10)] shadow-xl md:h-[561px] md:rounded-2xl">
        <img
          src={heroImage}
          alt={dish.dishName}
          className="absolute left-0 top-[-80px] h-full w-full object-cover md:top-[-460px] md:h-[1045px]"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent md:bg-gradient-to-l md:from-black/80 md:via-black/20 md:to-black/0" />

        {/* Tag */}
        <div className="absolute left-4 top-16 rounded-full bg-blue-800/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-[2px] md:left-16 md:top-[200px] md:px-4 md:py-1.5 md:text-xs">
          {dish.categoryName || t("tag")}
        </div>

        {/* Title */}
        <h1 className="absolute left-4 right-4 top-[270px] max-w-[520px] text-3xl font-medium leading-[36px] text-white
               md:left-16 md:top-[240px] md:max-w-[820px] md:text-6xl md:leading-[68px]
               lg:max-w-[920px] lg:text-7xl lg:leading-[76px]">
          {dish.dishName}
        </h1>

        {/* Subtitle */}
        <p className="absolute left-4 right-4 top-[370px] max-w-[380px] text-sm font-light leading-5 text-white/90 md:left-16 md:top-[400px] md:max-w-[520px] md:text-xl md:leading-7">
          {dish.slogan || dish.shortDescription || t.rich("subtitle", { br: () => <br /> })}
        </p>

        {/* Buttons */}
        <div className="absolute left-4 right-4 top-[450px] flex flex-row gap-2 md:left-16 md:right-auto md:top-[488px] md:gap-3">
          <button
            type="button"
            className="h-11 flex-1 whitespace-nowrap rounded-lg bg-white px-3 shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.10)] shadow-lg md:h-12 md:flex-none md:w-auto md:min-w-[240px] md:px-4"
          >
            <span className="text-sm font-bold text-blue-800 md:text-base">
              {t("reserve")}
            </span>
          </button>

          <button
            type="button"
            className="h-11 flex-1 whitespace-nowrap rounded-lg bg-black/40 px-3 outline outline-1 outline-offset-[-1px] outline-white/20 backdrop-blur-[6px] md:h-12 md:flex-none md:w-auto md:min-w-[128px] md:px-4"
          >
            <span className="text-sm font-medium text-white md:text-base">{t("share")}</span>
          </button>
        </div>

        {/* Order Now */}
        <button
          type="button"
          className="absolute bottom-6 left-4 right-4 h-12 w-auto whitespace-nowrap rounded-lg bg-amber-400 px-6 shadow-lg md:left-auto md:right-[150px] md:top-[492px] md:bottom-auto md:h-11 md:w-auto md:min-w-[112px]"
          onClick={onOrderNow}
        >
          <span className="text-base font-bold text-blue-950 md:text-sm md:font-medium">{t("order_now")}</span>
        </button>

        {/* Photo / 360 / Video pill (UI only) */}
        <div className="absolute left-1/2 top-4 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/30 p-1 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-md md:gap-2 md:p-1.5">
          <button
            type="button"
            className="rounded-full bg-white/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white outline outline-1 outline-offset-[-1px] outline-white/20 shadow-lg md:px-6 md:py-2.5 md:text-xs"
          >
            {t("photo")}
          </button>
          <button
            type="button"
            className="rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/70 md:px-6 md:py-2.5 md:text-xs"
          >
            {t("view_360")}
          </button>
          <button
            type="button"
            className="rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/70 md:px-6 md:py-2.5 md:text-xs"
          >
            {t("video")}
          </button>
        </div>
      </div>
    </section>
  );
}
