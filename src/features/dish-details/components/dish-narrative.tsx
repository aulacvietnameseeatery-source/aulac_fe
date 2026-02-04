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
        <div className="text-xs font-bold uppercase tracking-[2.40px] text-blue-800 md:text-sm md:tracking-[2.80px]">
          {t("label")}
        </div>
      </div>

      <h2 className="mt-4 text-2xl leading-8 text-neutral-900 md:mt-6 md:text-3xl md:leading-9 lg:text-4xl lg:leading-10">
        {dish.slogan || t.rich("title", { br: () => <br /> })}
      </h2>

      <div className="mt-4 text-base leading-6 text-gray-600 md:mt-6 md:text-lg md:leading-7">
        <span className="mr-2 inline-block align-top text-xl md:text-2xl">{firstChar}</span>
        {restText}
      </div>

      {dish.calories && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <span className="font-semibold">Calories:</span>
          <span>{dish.calories} kcal</span>
        </div>
      )}

      {(dish.prepTimeMinutes || dish.cookTimeMinutes) && (
        <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
          {dish.prepTimeMinutes && (
            <div className="flex items-center gap-2">
              <span className="font-semibold">Prep Time:</span>
              <span>{dish.prepTimeMinutes} min</span>
            </div>
          )}
          {dish.cookTimeMinutes && (
            <div className="flex items-center gap-2">
              <span className="font-semibold">Cook Time:</span>
              <span>{dish.cookTimeMinutes} min</span>
            </div>
          )}
        </div>
      )}

      {/* Pairing card - keep as UI only for now */}
      <div className="relative mt-8 overflow-hidden rounded-xl bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] outline outline-1 outline-offset-[-1px] outline-slate-200 md:mt-10">
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
      </div>
    </div>
  );
}
