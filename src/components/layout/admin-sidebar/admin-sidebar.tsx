"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Table,
  Users,
  UtensilsCrossed,
  ShoppingBag,
  FileText,
  Mail,
  Settings,
  UserCog,
  Tags,
  Package,
  LogOut,
  X
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { useLogout } from "@/features/customer/auth/login/hooks";
import { ConfirmModal } from "@/components/layout/admin-sidebar/confirm-modal";
import Image from "next/image";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Tables", href: "/dashboard/tables", icon: Table },
  { name: "Staff", href: "/dashboard/staff", icon: Users },
  { name: "Roles", href: "/dashboard/roles", icon: UserCog },
  { name: "Dish", href: "/dashboard/dish", icon: UtensilsCrossed },
  { name: "Ingredient", href: "/dashboard/ingredient", icon: Package },
  { name: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
  { name: "Reports", href: "/dashboard/reports", icon: FileText },
  { name: "Emails", href: "/dashboard/emails", icon: Mail },
  { name: "Customers", href: "/dashboard/customers", icon: Users },
  { name: "Reservations", href: "/dashboard/reservations", icon: Users },
  { name: "Promotions", href: "/dashboard/promotions", icon: Tags },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface AdminSidebarProps {
  onClose?: () => void;
}

export function AdminSidebar({ onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { userInfo } = useAuth();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/en/dashboard" || pathname === "/fr/dashboard";
    }
    return pathname?.includes(href);
  };

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
  };

  return (
    <>
      <div
        className={`
          h-full bg-gradient-to-b from-[#1A3A51] to-[#0D1D29] flex flex-col relative shadow-2xl border-r border-white/5 transition-all duration-300
          w-72 md:w-20 ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}
        `}
      >
        {/* Decorative Glow */}
        <div className="absolute top-0 left-0 w-full h-[200px] bg-[#FFAB2D]/5 blur-[60px] pointer-events-none" />

        {/* Close Button (Mobile Only) */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors z-20"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-[#1A3A51] border border-white/10 rounded-full items-center justify-center text-[#FFAB2D] hover:bg-[#FFAB2D] hover:text-[#1A3A51] transition-all duration-300 z-50 shadow-lg"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Logo Section */}
        <div className="px-8 md:px-2 lg:px-2 pt-5 pb-1 flex flex-col items-center relative z-10 border-b border-white/5 transition-all duration-300 min-h-[80px] justify-center">
          {/* Full Logo (Mobile & Desktop Expanded) */}
          {!isCollapsed && (
            <Image
              width={1000}
              height={1000}
              style={{ height: "100px", width: "auto" }}
              src="/images/logo.png"
              alt="Au Lac Logo"
              className="block md:hidden lg:block w-full h-full object-contain drop-shadow-md"
            />
          )}

          {/* Icon Only (Tablet & Desktop Collapsed) */}
          <div
            className={`
              w-16 h-16 bg-white/5 rounded-xl items-center justify-center p-2
              ${isCollapsed ? 'lg:flex hidden' : 'hidden md:flex lg:hidden'}
            `}
          >
            <Image
              width={100}
              height={100}
              src="/images/logo.png"
              alt="Au Lac Logo"
              className="w-full h-full object-contain drop-shadow-md"
            />
          </div>

          <div className={`text-center mt-0 md:hidden ${isCollapsed ? 'lg:hidden' : 'lg:block'}`}>
            <h2 className="text-white text-xl font-bold font-display tracking-tight">Au Lac</h2>
            <p className="text-[#FFAB2D]/80 text-[10px] font-medium uppercase tracking-[0.2em] mt-1">Manager Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 md:px-2 lg:px-2 py-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose} // Auto close on mobile
                  className={`
                    group flex items-center gap-3 px-4 md:px-0 lg:px-0 py-3 md:py-3 lg:py-3 rounded-xl transition-all duration-300 relative overflow-hidden md:justify-center 
                    ${isCollapsed ? 'lg:justify-center' : 'lg:justify-start lg:px-4'}
                    ${active
                      ? "text-[#FFAB2D] bg-white/5 shadow-lg shadow-black/20 ring-1 ring-white/5"
                      : "text-white/60 hover:text-white hover:bg-white/5 hover:shadow-md"
                    }
                  `}
                  title={isCollapsed ? item.name : undefined} // Tooltip for collapsed state
                >
                  {/* Active Indicator Line */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#FFAB2D] rounded-r-full shadow-[0_0_12px_#FFAB2D]" />
                  )}

                  <Icon className={`w-5 h-5 transition-transform duration-300 ${active ? "scale-110" : "group-hover:scale-110"}`} />
                  <span
                    className={`
                      text-[13px] font-medium tracking-wide ${active ? "font-semibold" : ""} 
                      md:hidden ${isCollapsed ? 'lg:hidden' : 'lg:block'}
                    `}
                  >
                    {item.name}
                  </span>

                  {/* Hover Glow */}
                  <div className={`absolute inset-0 bg-gradient-to-r from-[#FFAB2D]/0 via-[#FFAB2D]/[0.03] to-[#FFAB2D]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ${active ? "hidden" : ""}`} />
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className={`p-4 md:p-2 mx-4 md:mx-2 mb-4 bg-white/5 rounded-2xl border border-white/5 shadow-lg backdrop-blur-sm ${isCollapsed ? 'lg:p-2 lg:mx-2 bg-transparent border-0 shadow-none' : 'lg:p-4 lg:mx-4'}`}>
          <div className={`flex items-center gap-3 md:justify-center ${isCollapsed ? 'lg:justify-center' : 'lg:justify-start'}`}>
            <div className={`flex items-center gap-3 flex-1 min-w-0 md:hidden ${isCollapsed ? 'lg:hidden' : 'lg:flex'}`}>
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FFAB2D] to-[#E68A00] rounded-full flex items-center justify-center text-[#1A3A51] font-bold shadow-lg ring-2 ring-[#1A3A51] overflow-hidden">
                  {/* Use first letter of username or AD as fallback */}
                  {userInfo?.username ? userInfo.username.charAt(0).toUpperCase() : "AD"}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1A3A51]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-semibold truncate">
                  {userInfo?.username || "Admin User"}
                </div>
                {/* Show roles if available */}
                <div className="text-white/40 text-[10px] truncate">
                  {userInfo?.roles && userInfo.roles.length > 0 ? userInfo.roles.join(", ") : "Online"}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogoutClick}
              disabled={isLoggingOut}
              className={`
                transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                ${isCollapsed || 'md:hidden' /* Logic for collapsed state styling */
                  ? 'md:flex lg:flex p-3 rounded-xl bg-white/10 text-[#FFAB2D] hover:bg-[#FF2D2D] hover:text-white mx-auto'
                  : 'p-2 rounded-lg text-white/40 hover:text-[#FF2D2D] hover:bg-[#FF2D2D]/10'
                }
              `}
              title={isLoggingOut ? "Logging out..." : "Logout"}
            >
              <LogOut className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4 md:w-5 md:h-5'} ${isLoggingOut ? 'animate-pulse' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Logout"
        message="Are you sure you want to logout? You will be redirected to the login page."
        confirmText="Logout"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
}
