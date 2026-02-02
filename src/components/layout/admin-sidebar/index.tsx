"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  UtensilsCrossed, 
  ShoppingBag,
  FileText,
  Mail,
  Settings,
  UserCog,
  Tags,
  Package,
  LogOut
} from "lucide-react";
import { tokenStorage } from "@/lib/auth-storage";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Tables", href: "/dashboard/tables", icon: LayoutDashboard },
  { name: "Staff", href: "/dashboard/staff", icon: Users },
  { name: "Roles", href: "/dashboard/roles", icon: UserCog },
  { name: "Dish", href: "/dashboard/dish", icon: UtensilsCrossed },
  { name: "Ingredient", href: "/dashboard/ingredient", icon: Package },
  { name: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
  { name: "Reports", href: "/dashboard/reports", icon: FileText },
  { name: "Emails", href: "/dashboard/emails", icon: Mail },
  { name: "Customers", href: "/dashboard/customers", icon: Users },
  { name: "Promotions", href: "/dashboard/promotions", icon: Tags },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/en/dashboard" || pathname === "/fr/dashboard";
    }
    return pathname?.includes(href);
  };

  const handleLogout = () => {
    tokenStorage.clearAuth();
    router.push("/login");
  };

  return (
    <div className="w-60 h-screen bg-[#18312E] flex flex-col fixed left-0 top-0">
      {/* Logo Section */}
      <div className="px-8 py-4 flex flex-col items-center">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-1">
          <span className="text-white text-lg font-medium font-['Lexend']">A</span>
        </div>
        <div className="text-center text-white text-xl font-medium font-['Lexend'] leading-6">
          Au Lac
        </div>
        <div className="text-white/50 text-xs font-medium font-['Lexend'] uppercase leading-5 tracking-wide">
          Manager Portal
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                  ${active 
                    ? "bg-[#2d5f5f] text-white" 
                    : "text-white/70 hover:text-white hover:bg-[#2d5f5f]/50"
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium font-['Lexend']">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-l from-yellow-200 to-yellow-500 rounded-full border border-white/20 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-medium font-['Lexend'] truncate">
              Admin User
            </div>
            <div className="text-white/50 text-[10px] font-medium font-['Lexend'] truncate">
              admin@aulac.com
            </div>
          </div>
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-[#2d5f5f]/50 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
