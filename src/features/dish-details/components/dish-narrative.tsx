"use client";

import { useTranslations } from "next-intl";

export function DishNarrative() {
  const t = useTranslations("DishDetails.Narrative");

  return (
    <div>
      <div className="border-b border-blue-800/20 pb-2">
        <div className="text-sm font-bold uppercase tracking-[2.80px] text-blue-800">
          {t("label")}
        </div>
      </div>

      <h2 className="mt-6 text-3xl leading-9 text-neutral-900 md:text-4xl md:leading-10">
        {t.rich("title", { br: () => <br /> })}
      </h2>

      <div className="mt-6 text-lg leading-7 text-gray-600">
        <span className="mr-2 inline-block align-top text-2xl">D</span>
        {t("paragraph_1").substring(1)}
      </div>

      <p className="mt-6 text-lg leading-7 text-gray-600">
        {t("paragraph_2")}
      </p>

      <p className="mt-6 text-lg leading-7 text-gray-600">
        {t("paragraph_3")}
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
                {t("pairing_label")}
              </div>
              <div className="mt-1 text-xl font-bold leading-7 text-neutral-900">
                {t("pairing_title")}
              </div>
              <p className="mt-3 text-sm leading-5 text-gray-500">
                {t("pairing_desc")}
              </p>
            </div>

            <button
              type="button"
              className="h-9 w-32 rounded-lg outline outline-1 outline-offset-[-1px] outline-blue-800"
            >
              <span className="text-sm font-bold text-blue-800">{t("add_to_order")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
