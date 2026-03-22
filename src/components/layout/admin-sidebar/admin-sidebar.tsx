"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import {
  LayoutDashboard,
  Table,
  Users,
  UtensilsCrossed,
  FileText,
  Mail,
  Settings,
  Settings2,
  UserCog,
  Tags,
  Package,
  LogOut,
  X,
  FolderOpen,
  ChevronRight,
  ChevronLeft,
  Layers,
  Merge,
  CalendarClock,
  UserRound,
  LayoutList,
  Bell,
  Warehouse,
  TicketPercent,
  ChefHat,
  Truck,
  FileSpreadsheet,
  BadgeDollarSign,
  Clock,
  Radio,
  BarChart3,
  UserCheck,
  Building2,
  Presentation,
  Users as UsersIcon,
  BadgePercent,
} from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { useLogout } from "@/features/customer/auth/login/hooks";
import { usePermissions } from "@/hooks/use-permissions";
import { Permissions } from "@/types/const";
import { ConfirmModal } from "@/components/layout/admin-sidebar/confirm-modal";
import Image from "next/image";
import { useTranslations } from "next-intl";
// _OLD: import { NotificationPanel as NotificationPanel_DEPRECATED } from "./notification-panel";
import { NotificationCenter, useNotificationStore } from "@/features/staff/notifications";
import { useStoreSettings } from "@/hooks/use-store-settings";
import { LucideIcon } from "lucide-react";

interface NavItem {
  key: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
  children?: NavItem[];
}

interface NavCategory {
  status: string;
  icon: LucideIcon;
  items: NavItem[];
}

const navigation: NavCategory[] = [
  {
    status: "main",
    icon: LayoutDashboard,
    items: [
      { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
      { key: "orders", href: "/dashboard/orders", icon: LayoutList },
      { key: "kitchen", href: "/dashboard/kitchen", icon: ChefHat },
      { key: "reservations", href: "/dashboard/reservations", icon: CalendarClock },
    ]
  },
  {
    status: "management",
    icon: Layers,
    items: [
      { key: "dish", href: "/dashboard/dish", icon: UtensilsCrossed },
      { key: "dishCategory", href: "/dashboard/dish-category", icon: FolderOpen },
      { key: "ingredients", href: "/dashboard/ingredients", icon: Package },
      { key: "suppliers", href: "/dashboard/suppliers", icon: Truck },
      { key: "coupons", href: "/dashboard/coupons", icon: TicketPercent },
    ]
  },
  {
    status: "operations",
    icon: Merge,
    items: [
      { key: "tables", href: "/dashboard/tables", icon: Table },
      { key: "customers", href: "/dashboard/customers", icon: UserRound },
      { key: "invoices", href: "/dashboard/invoices", icon: FileSpreadsheet },
      { key: "payments", href: "/dashboard/payments", icon: BadgeDollarSign },
    ]
  },
  {
    status: "shifts",
    icon: Clock,
    items: [
      { key: "shiftsTemplates", href: "/dashboard/shifts/templates", icon: FolderOpen, permission: Permissions.ManageShiftTemplate },
      { key: "shifts", href: "/dashboard/shifts/schedule", icon: Clock, permission: Permissions.ViewShift },
      { key: "shiftsLive", href: "/dashboard/shifts/live", icon: Radio, permission: Permissions.ViewShift },
      { key: "shiftsReports", href: "/dashboard/shifts/reports", icon: BarChart3, permission: Permissions.ViewShiftReport },
      { key: "myShifts", href: "/dashboard/my-shifts", icon: UserCheck }, // All staff can see their shifts
    ]
  },
  {
    status: "administration",
    icon: UserCog,
    items: [
      { key: "staff", href: "/dashboard/staff", icon: Users },
      { key: "roles", href: "/dashboard/roles", icon: UserCog },
      { key: "reports", href: "/dashboard/reports", icon: FileText },
    ]
  },
  {
    status: "settings",
    icon: Settings,
    items: [
      {
        key: "storeSettings",
        href: "/dashboard/store-settings",
        icon: Warehouse,
        children: [
          { key: "storeProfile", href: "/dashboard/store-settings?tab=profile", icon: Building2 },
          { key: "storeIntroduction", href: "/dashboard/store-settings?tab=introduction", icon: Presentation },
          { key: "storeAboutUs", href: "/dashboard/store-settings?tab=about", icon: UsersIcon },
          { key: "taxSettings", href: "/dashboard/store-settings?tab=tax", icon: BadgePercent },
        ]
      },
      { key: "notifications", href: "/dashboard/notifications", icon: Bell },
      { key: "promotions", href: "/dashboard/promotions", icon: Tags },
      { key: "emails", href: "/dashboard/emails", icon: Mail },
    ]
  }
];

interface AdminSidebarProps {
  onClose?: () => void;
}

export function AdminSidebar({ onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string || 'vi';
  const { userInfo } = useAuth();
  const { can } = usePermissions();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const { data: storeSettings } = useStoreSettings();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const t = useTranslations("AdminSidebar");

  const filteredNavigation = useMemo(() => {
    return navigation.map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (item.permission && !can(item.permission)) {
          return false;
        }
        return true;
      }),
    })).filter(cat => cat.items.length > 0);
  }, [can]);

  const pathWithoutLocale = useMemo(() => pathname?.replace(/^\/(en|fr|vi)/, '') || pathname, [pathname]);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathWithoutLocale === "/dashboard";
    }
    return pathWithoutLocale === href || pathWithoutLocale?.startsWith(href + "/") || pathWithoutLocale?.startsWith(href + "?");
  };

  // Determine which category the current route belongs to
  const routeCategory = useMemo(() => {
    return filteredNavigation.find(cat =>
      cat.items.some(item => isActive(item.href))
    )?.status || "main";
  }, [pathWithoutLocale, filteredNavigation]);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hoverCategory, setHoverCategory] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  // Close notifications when clicking outside the sidebar
  useEffect(() => {
    if (!isNotificationsOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // We check if it's NOT inside a notification panel or toggle button
      if (!target.closest('.admin-sidebar-container') && !target.closest('.notification-toggle')) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotificationsOpen]);

  // The category we actually show in column 2
  const displayedCategory = hoverCategory || selectedCategory || routeCategory;

  const currentCategoryItems = useMemo(() => {
    return filteredNavigation.find(cat => cat.status === displayedCategory)?.items || [];
  }, [displayedCategory, filteredNavigation]);

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    logout();
    setIsLogoutModalOpen(false);
  };

  return (
    <>
      <div className="h-full flex relative shadow-2xl transition-all duration-300 w-[max-content] admin-sidebar-container">

        {/* Column 1: Mini Sidebar */}
        <div className="w-[70px] bg-[#1A3A51] border-r border-white/5 flex flex-col items-center py-6 z-30">
          <Link href={`/${locale}/`} className="mb-8 px-2 transition-transform hover:scale-105 active:scale-95" title="Về Trang Chủ">
            <Image
              width={40}
              height={40}
              src={storeSettings?.logoUrl || "/images/logo.png"}
              alt="An Lac"
              className="w-10 h-10 object-contain drop-shadow-lg"
            />
          </Link>

          <div className="flex-1 flex flex-col gap-4 w-full px-2">
            {filteredNavigation.map((cat) => {
              const Icon = cat.icon;
              const isRouteActive = routeCategory === cat.status;
              const isSelected = selectedCategory === cat.status;
              const isHovered = hoverCategory === cat.status;
              const isActuallySelected = isSelected || (selectedCategory === null && isRouteActive);

              return (
                <button
                  key={cat.status}
                  onMouseEnter={() => setHoverCategory(cat.status)}
                  onMouseLeave={() => setHoverCategory(null)}
                  onClick={() => {
                    setSelectedCategory(cat.status);
                    if (isCollapsed) setIsCollapsed(false);
                  }}
                  className={`
                    relative w-full aspect-square flex items-center justify-center rounded-xl transition-all duration-300
                    ${isActuallySelected
                      ? "bg-[#FFAB2D] text-[#1A3A51] shadow-[0_0_15px_rgba(255,171,45,0.3)]"
                      : (isHovered ? "bg-white/10 text-white" : "text-white/40 hover:text-white hover:bg-white/5")
                    }
                  `}
                  title={t(`categories.${cat.status}`)}
                >
                  <Icon size={22} className={`${isActuallySelected ? "scale-110" : ""}`} />

                  {isActuallySelected && !isHovered && (
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#FFAB2D] rounded-r-full shadow-lg" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Column 1 Bottom: Notifications + Profile */}
          <div className="mt-auto px-2 w-full flex flex-col gap-4 items-center">
            {/* Notification Bell */}
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={`
                relative p-3 rounded-xl transition-all group notification-toggle
                ${isNotificationsOpen ? 'bg-white/10 text-[#FFAB2D]' : 'text-white/40 hover:text-[#FFAB2D] hover:bg-white/5'}
              `}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-4.5 h-4.5 px-1 text-[10px] font-semibold text-white bg-red-500 rounded-full leading-none">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {/* _OLD: {isNotificationsOpen && (<NotificationPanel_DEPRECATED onClose={() => setIsNotificationsOpen(false)} />)} */}
            <NotificationCenter
              open={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)}
            />

            <button
              onClick={handleLogoutClick}
              disabled={isLoggingOut}
              className="p-3 rounded-xl text-white/40 hover:text-[#FF2D2D] hover:bg-red-500/10 transition-colors"
              title={t('logout')}
            >
              <LogOut size={20} className={isLoggingOut ? "animate-spin" : ""} />
            </button>
            <div className="relative group cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFAB2D] to-[#E68A00] flex items-center justify-center text-[#1A3A51] font-bold text-sm shadow-md ring-2 ring-white/10 group-hover:ring-[#FFAB2D] transition-all">
                {userInfo?.username ? userInfo.username.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#1A3A51] rounded-full" />

              {/* Tooltip profile */}
              <div className="absolute left-full ml-4 bottom-0 w-48 bg-[#1A3A51] border border-white/10 rounded-xl shadow-2xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <p className="text-white text-sm font-semibold truncate">{userInfo?.username || "Admin"}</p>
                <p className="text-white/50 text-[10px] uppercase tracking-wider mt-1">{userInfo?.roles?.[0] || t('managerPortal')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Specific Menu */}
        <div
          className={`
            bg-[#0D1D29] flex flex-col h-full border-r border-white/5 z-20 transition-all duration-300 overflow-hidden
            ${isCollapsed ? 'w-0 border-r-0 shadow-none' : 'w-[240px] shadow-2xl'}
          `}
        >
          <div className="p-6 border-b border-white/5 flex items-center justify-between whitespace-nowrap">
            <h3 className="text-[#FFAB2D] text-[11px] font-bold tracking-[0.2em] uppercase">
              {t(`categories.${displayedCategory}`)}
            </h3>
            {onClose && (
              <button onClick={onClose} className="text-white/40 hover:text-white md:hidden">
                <X size={18} />
              </button>
            )}
          </div>

          <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
            <ul className="space-y-1.5">
              {currentCategoryItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                const label = t(item.key);
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = hasChildren && (active || item.children?.some(child => isActive(child.href)));

                return (
                  <li key={item.key} className="space-y-1">
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`
                        group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                        ${active && !hasChildren
                          ? "bg-white/5 text-[#FFAB2D] shadow-inner"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                        }
                        ${isExpanded ? "text-white bg-white/5" : ""}
                      `}
                    >
                      <Icon size={18} className={`transition-transform duration-300 ${active ? "scale-110" : "group-hover:translate-x-1"}`} />
                      <span className="text-[13px] font-medium">{label}</span>
                      {hasChildren ? (
                        <div className="ml-auto">
                          <ChevronRight size={14} className={`transition-transform duration-300 opacity-50 ${isExpanded ? "rotate-90" : ""}`} />
                        </div>
                      ) : active && (
                        <div className="ml-auto">
                          <ChevronRight size={14} className="opacity-50" />
                        </div>
                      )}
                    </Link>

                    {hasChildren && isExpanded && (
                      <ul className="ml-4 pl-4 border-l border-white/5 mt-1 space-y-1 animate-in fade-in slide-in-from-top-1 duration-300">
                        {item.children?.map((child) => {
                          const ChildIcon = child.icon;
                          const childActive = isActive(child.href);
                          return (
                            <li key={child.key}>
                              <Link
                                href={child.href}
                                onClick={onClose}
                                className={`
                                  group flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all
                                  ${childActive
                                    ? "text-[#FFAB2D] bg-white/5"
                                    : "text-white/40 hover:text-white hover:bg-white/5"
                                  }
                                `}
                              >
                                <ChildIcon size={16} className={`transition-transform ${childActive ? "scale-110" : "group-hover:translate-x-0.5"}`} />
                                <span className="text-[12px] font-medium">{t(child.key)}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Global Collapse Toggle - Sticky on the edge */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-[#1A3A51] border border-white/10 rounded-full flex items-center justify-center text-[#FFAB2D] hover:bg-[#FFAB2D] hover:text-[#1A3A51] transition-all duration-300 z-50 shadow-lg"
          title={isCollapsed ? t('expand') : t('collapse')}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

      </div>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        title={t('logout')}
        message={t('logoutMessage')}
        confirmText={t('logout')}
        cancelText={t('cancel')}
        variant="danger"
      />

      {/* Styled scrollbar for the detail menu */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </>
  );
}
