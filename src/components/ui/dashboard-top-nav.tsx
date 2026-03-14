"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  ShoppingCart, 
  LayoutGrid, 
  ChefHat, 
  CalendarCheck, 
  Grid3X3 
} from "lucide-react";

const NAV_ITEMS = [
  { id: "pos", label: "POS", href: "/dashboard/orders/create", icon: <ShoppingCart className="w-4 h-4" /> },
  { id: "orders", label: "Orders", href: "/dashboard/orders", icon: <LayoutGrid className="w-4 h-4" /> },
  { id: "kitchen", label: "Kitchen", href: "/dashboard/kitchen", icon: <ChefHat className="w-4 h-4" /> },
  { id: "reservation", label: "Reservation", href: "/dashboard/reservations", icon: <CalendarCheck className="w-4 h-4" /> },
  { id: "table", label: "Table", href: "/dashboard/tables", icon: <Grid3X3 className="w-4 h-4" /> },
];

export function DashboardTopNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.id}
            href={item.href}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] transition-all duration-200 ${
              isActive
                ? "text-[#1A3A52] bg-[#D5BA98]/20 font-semibold shadow-sm"
                : "text-gray-500 hover:text-[#1A3A52] hover:bg-gray-50"
            }`}
          >
            <span className={isActive ? "text-[#1A3A52]" : "text-gray-400"}>
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}