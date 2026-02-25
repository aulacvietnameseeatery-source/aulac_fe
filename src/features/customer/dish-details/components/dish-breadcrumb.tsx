"use client";

import { useTranslations } from "next-intl";
import { ChevronRight, Home, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { Dish } from "../types";

type DishBreadcrumbProps = {
  dish: Dish;
};

export function DishBreadcrumb({ dish }: DishBreadcrumbProps) {
  const t = useTranslations("Breadcrumb");

  return (
    <div className="sticky top-0 z-10 w-full border-b border-stone-300 bg-white shadow-md">
      <div className="mx-auto flex h-14 w-full max-w-[1232px] items-center px-4 md:h-16 md:px-6">
        <nav aria-label="Breadcrumb" className="flex items-center">
          <ol className="flex items-center gap-1.5 text-xs md:gap-2 md:text-sm">
            {/* Home */}
            <li className="flex items-center">
              <Link 
                href="/"
                className="group flex items-center gap-1.5 rounded-md px-2 py-1.5 transition-all duration-200 hover:bg-stone-100 active:scale-95"
              >
                <Home className="h-3.5 w-3.5 text-stone-600 transition-colors group-hover:text-stone-900 md:h-4 md:w-4" />
                <span className="font-body font-medium text-stone-700 transition-colors group-hover:text-stone-900">
                  {t("home")}
                </span>
              </Link>
            </li>

            {/* Separator */}
            <li>
              <ChevronRight className="h-3.5 w-3.5 text-stone-400 md:h-4 md:w-4" />
            </li>

            {/* Menu */}
            <li className="flex items-center">
              <Link 
                href="/menu"
                className="group flex items-center gap-1.5 rounded-md px-2 py-1.5 transition-all duration-200 hover:bg-stone-100 active:scale-95"
              >
                <UtensilsCrossed className="h-3.5 w-3.5 text-stone-600 transition-colors group-hover:text-stone-900 md:h-4 md:w-4" />
                <span className="font-body font-medium text-stone-700 transition-colors group-hover:text-stone-900">
                  {t("menu")}
                </span>
              </Link>
            </li>

            {/* Separator */}
            <li>
              <ChevronRight className="h-3.5 w-3.5 text-stone-400 md:h-4 md:w-4" />
            </li>

            {/* Current Page */}
            <li className="flex items-center">
              <span className="font-body flex items-center gap-1.5 rounded-md bg-stone-200 px-2 py-1.5 font-semibold text-stone-900">
                {dish.dishName}
              </span>
            </li>
          </ol>
        </nav>
      </div>
    </div>
  );
}
