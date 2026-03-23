"use client";

import { usePathname, useParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ShoppingCart,
  LayoutGrid,
  ChefHat,
  CalendarCheck,
  Grid3X3
} from "lucide-react";

// Thay đổi label thành key để dùng cho i18n
const NAV_ITEMS = [
  { id: "pos", key: "pos", href: "/dashboard/orders/create", icon: <ShoppingCart className="w-4 h-4" /> },
  { id: "orders", key: "orders", href: "/dashboard/orders", icon: <LayoutGrid className="w-4 h-4" /> },
  { id: "kitchen", key: "kitchen", href: "/dashboard/kitchen", icon: <ChefHat className="w-4 h-4" /> },
  { id: "reservation", key: "reservation", href: "/dashboard/reservations", icon: <CalendarCheck className="w-4 h-4" /> },
  { id: "table", key: "table", href: "/dashboard/tables", icon: <Grid3X3 className="w-4 h-4" /> },
];

export function DashboardTopNav() {
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string || 'vi';
  const t = useTranslations("navigation.dashboardTopNav");

  const pathWithoutLocale = pathname?.replace(/^\/(en|fr|vi)/, '') || pathname;

  const isActive = (href: string) => {
    if (href === "/dashboard/orders") {
      return pathWithoutLocale === "/dashboard/orders";
    }
    return pathWithoutLocale === href || pathWithoutLocale?.startsWith(href + "/") || pathWithoutLocale?.startsWith(href + "?");
  };

  return (
    <nav className="flex items-center gap-1">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.id}
            href={`/${locale}${item.href}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all duration-200 group relative ${active
                ? "text-[#1A3A52] bg-[#D5BA98]/20 font-semibold shadow-sm"
                : "text-gray-500 hover:text-[#1A3A52] hover:bg-gray-50"
              }`}
          >
            <span className={`transition-colors duration-200 ${active ? "text-[#1A3A52]" : "text-gray-400 group-hover:text-[#1A3A52]"}`}>
              {item.icon}
            </span>
            <span>{t(item.key)}</span>

            {!active && (
              <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-[#1A3A52] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out rounded-full opacity-30" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}