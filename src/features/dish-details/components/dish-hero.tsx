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


      

      {/* Dish Information - Moved below image */}
      {/* <div className="px-4 py-6 md:px-0 md:py-8">
        <h1 className="mb-2 text-3xl font-semibold text-gray-900 md:text-4xl">
          {dish.dishName}
        </h1>

        <p className="mb-4 text-xl font-semibold text-gray-900 md:text-2xl">
          {dish.price?.toLocaleString('vi-VN')}₫
        </p>

        <div className="space-y-2 text-sm text-gray-700 md:text-base">
          {(dish.description || dish.slogan || dish.shortDescription) && (
            <div>{dish.description || dish.slogan || dish.shortDescription}</div>
          )}
        </div>
      </div> */}
      
      
      
    </section>

    
  );
}
