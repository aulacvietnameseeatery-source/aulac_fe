"use client";

import { useTranslations } from "next-intl";

export function DishBreadcrumb() {
  const t = useTranslations("Breadcrumb");

  return (
    <div className="sticky top-0 z-10 w-full border-b border-stone-200 bg-stone-50/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-full max-w-[1232px] items-center px-3 md:h-20 md:px-4">
        <div className="flex items-center gap-2 text-xs font-medium text-neutral-950 md:gap-3 md:text-sm">
          <span>{t("home")}</span>
          <span className="opacity-60">-&gt;</span>
          <span>{t("menu")}</span>
          <span className="opacity-60">-&gt;</span>
          <span>{t("dish_details")}</span>
        </div>
      </div>
    </div>
  );
}
