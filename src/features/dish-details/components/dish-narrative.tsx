"use client";

import { useTranslations } from "next-intl";
import { Dish } from "../types";

type DishNarrativeProps = {
  dish: Dish;
};

export function DishNarrative({ dish }: DishNarrativeProps) {
  const t = useTranslations("DishDetails.Narrative");

  // Use real description or fallback to translation
  const description = dish.description || t("paragraph_1");
  const firstChar = description.charAt(0);
  const restText = description.substring(1);

  return (
    <div>
      <div className="border-b border-blue-800/20 pb-2">
        {dish.categoryName && (
          <div className="inline-block rounded-full bg-blue-800/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-800 md:px-4 md:py-1.5 md:text-xs">
            {dish.categoryName}
          </div>
        )}
      </div>

      {/* Dish Name */}
      <h2 className="mt-4 text-2xl font-bold leading-8 text-neutral-900 md:mt-6 md:text-3xl md:leading-9 lg:text-4xl lg:leading-10">
        {dish.dishName}
      </h2>

      {/* Price */}
      <div className="mt-3 text-xl font-semibold text-blue-800 md:text-2xl">
        {dish.price?.toLocaleString('vi-VN')} 
      </div>

      {/* Slogan */}
      {dish.slogan && (
        <div className="mt-4 text-2xl italic leading-8 text-gray-700 md:text-2xl md:leading-8">
          {dish.slogan}
        </div>
      )}

      {/* Short Description */}
      {dish.shortDescription && (
        <div className="mt-3 text-xl leading-8 text-gray-600 md:text-xl md:leading-8">
          {dish.shortDescription}
        </div>
      )}

      {/* Full Description */}
      {dish.description && (
        <div className="mt-4 text-xl leading-8 text-gray-600 md:mt-6 md:text-xl md:leading-8">
          <span className="mr-2 inline-block align-top text-3xl font-semibold text-gray-900 md:text-3xl">{dish.description.charAt(0)}</span>
          {dish.description.substring(1)}
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 border-t border-slate-200 pt-6 md:mt-12 md:pt-8">
        <div className="grid grid-cols-2 gap-4 md:gap-x-10 md:gap-y-6">
          {dish.prepTimeMinutes && (
            <div className="rounded-lg bg-slate-50 p-4 md:bg-transparent md:p-0">
              <div className="text-sm font-bold uppercase tracking-wider text-gray-600 md:text-xs">
                Prep Time
              </div>
              <div className="mt-2 text-xl font-bold text-neutral-900 md:mt-1 md:text-base md:font-medium">
                {dish.prepTimeMinutes} min
              </div>
            </div>
          )}

          {dish.calories && (
            <div className="rounded-lg bg-slate-50 p-4 md:bg-transparent md:p-0">
              <div className="text-sm font-bold uppercase tracking-wider text-gray-600 md:text-xs">
                Calories
              </div>
              <div className="mt-2 text-xl font-bold text-neutral-900 md:mt-1 md:text-base md:font-medium">
                {dish.calories} kcal
              </div>
            </div>
          )}

          {dish.cookTimeMinutes && (
            <div className="rounded-lg bg-slate-50 p-4 md:bg-transparent md:p-0">
              <div className="text-sm font-bold uppercase tracking-wider text-gray-600 md:text-xs">
                Cook Time
              </div>
              <div className="mt-2 text-xl font-bold text-neutral-900 md:mt-1 md:text-base md:font-medium">
                {dish.cookTimeMinutes} min
              </div>
            </div>
          )}

  

          <div className="rounded-lg bg-slate-50 p-4 md:bg-transparent md:p-0">
            <div className="text-sm font-bold uppercase tracking-wider text-gray-600 md:text-xs">
              Spice Level
            </div>
            <div className="mt-2 text-xl font-bold text-orange-600 md:mt-1 md:text-base md:font-medium">
              Medium
            </div>
          </div>
        </div>
      </div>

      {/* Pairing card - keep as UI only for now */}
      {/* <div className="relative mt-8 overflow-hidden rounded-xl bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] outline-slate-200 md:mt-10">
        <div className="p-4 md:p-6 lg:p-8">
          <div className="flex flex-col items-start gap-4 md:flex-row md:gap-5">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-gray-100 outline outline-2 outline-offset-[-2px] outline-blue-800/20 md:h-24 md:w-24">
              <img
                src="/images/dish-detail/dish-narrative/dish-narrative.png"
                alt="Pairing"
                className="h-full w-full object-cover opacity-90"
              />
            </div>

            <div className="flex-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-800 md:text-xs">
                {t("pairing_label")}
              </div>
              <div className="mt-1 text-lg font-bold leading-6 text-neutral-900 md:text-xl md:leading-7">
                {t("pairing_title")}
              </div>
              <p className="mt-2 text-xs leading-4 text-gray-500 md:mt-3 md:text-sm md:leading-5">
                {t("pairing_desc")}
              </p>
            </div>

            <button
              type="button"
              className="h-8 w-full whitespace-nowrap rounded-lg px-4 outline outline-1 outline-offset-[-1px] outline-blue-800
             md:h-9 md:w-auto md:self-start"
            >
              <span className="text-xs font-bold text-blue-800 md:text-sm">
                {t("add_to_order")}
              </span>
            </button>

          </div>
        </div>
      </div> */}
    </div>
  );
}
