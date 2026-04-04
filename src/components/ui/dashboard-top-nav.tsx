"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/routing";
import { useTranslations } from "next-intl";
import {
  ShoppingCart,
  LayoutGrid,
  ChefHat,
  CalendarCheck,
  Grid3X3
} from "lucide-react";

const NAV_ITEMS = [
  { id: "pos", key: "pos", href: "/dashboard/orders/pos", icon: <ShoppingCart className="w-4 h-4" /> },
  { id: "orders", key: "orders", href: "/dashboard/orders", icon: <LayoutGrid className="w-4 h-4" /> },
  { id: "kitchen", key: "kitchen", href: "/dashboard/kitchen", icon: <ChefHat className="w-4 h-4" /> },
  { id: "reservation", key: "reservation", href: "/dashboard/reservations", icon: <CalendarCheck className="w-4 h-4" /> },
  { id: "table", key: "table", href: "/dashboard/tables", icon: <Grid3X3 className="w-4 h-4" /> },
];

export function DashboardTopNav() {
  const pathname = usePathname();
  const t = useTranslations("navigation.dashboardTopNav");

  const pathWithoutLocale = pathname?.replace(/^\/(en|fr|vi)/, '') || pathname;

  const isActive = (href: string) => {
    if (href === "/dashboard/orders") {
      return pathWithoutLocale === "/dashboard/orders";
    }
    return pathWithoutLocale === href || pathWithoutLocale?.startsWith(href + "/") || pathWithoutLocale?.startsWith(href + "?");
  };

  return (
      <nav className="flex items-center gap-1 overflow-x-auto">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const label = t(item.key);
          return (
              <Link
                  key={item.id}
                  href={item.href as any}
                  aria-label={label}
                  data-tooltip-content={label}
                  data-tooltip-id="my-tooltip"
                  className={`flex items-center justify-center xl:justify-start gap-2 rounded-md px-2.5 py-2 text-sm transition-all duration-200 group relative ${active
                      ? "text-[#1A3A52] bg-[#D5BA98]/20 font-semibold shadow-sm"
                      : "text-gray-500 hover:text-[#1A3A52] hover:bg-gray-50"
                  }`}
              >
            <span className={`transition-colors duration-200 ${active ? "text-[#1A3A52]" : "text-gray-400 group-hover:text-[#1A3A52]"}`}>
              {item.icon}
            </span>
                <span className="hidden xl:inline">{label}</span>

                {!active && (
                    <span className="absolute bottom-1 left-2.5 right-2.5 h-0.5 bg-[#1A3A52] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out rounded-full opacity-30 xl:left-4 xl:right-4" />
                )}
              </Link>
          );
        })}
      </nav>
  );
}