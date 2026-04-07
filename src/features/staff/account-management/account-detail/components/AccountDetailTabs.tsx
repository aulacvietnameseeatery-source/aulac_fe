"use client";

import React, { useState, lazy, Suspense } from "react";
import { User, Shield, KeyRound, ShoppingBag, Package, AlertTriangle, ScrollText, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { AccountDetail, AccountTabKey } from "../types/account-detail.types";

// Eagerly-loaded tabs (contain real data from the detail response)
import { GeneralTab } from "./tabs/GeneralTab";
import { RoleStatusTab } from "./tabs/RoleStatusTab";
import { SecurityTab } from "./tabs/SecurityTab";

// Lazy-loaded activity tabs (fetch their own data via hooks)
const OrdersTab = lazy(() => import("./tabs/OrdersTab").then((m) => ({ default: m.OrdersTab })));
const InventoryTab = lazy(() => import("./tabs/InventoryTab").then((m) => ({ default: m.InventoryTab })));
const ServiceErrorsTab = lazy(() => import("./tabs/ServiceErrorsTab").then((m) => ({ default: m.ServiceErrorsTab })));
const AuditLogsTab = lazy(() => import("./tabs/AuditLogsTab").then((m) => ({ default: m.AuditLogsTab })));
// const SystemSettingsTab = lazy(() => import("./tabs/SystemSettingsTab").then((m) => ({ default: m.SystemSettingsTab })));

type ActiveTabKey = Extract<AccountTabKey, "general" | "role-status" | "security" | "orders" | "inventory" | "service-errors" | "audit-logs">;

const TAB_CONFIG: { key: ActiveTabKey; labelKey: string; icon: React.ElementType }[] = [
  { key: "general",        labelKey: "general",       icon: User },
  { key: "role-status",    labelKey: "roleStatus",    icon: Shield },
  { key: "security",       labelKey: "security",      icon: KeyRound },
  { key: "orders",         labelKey: "orders",        icon: ShoppingBag },
  { key: "inventory",      labelKey: "inventory",     icon: Package },
  { key: "service-errors", labelKey: "serviceErrors", icon: AlertTriangle },
  { key: "audit-logs",     labelKey: "auditLogs",     icon: ScrollText },
];

// ============================================================

interface AccountDetailTabsProps {
  account: AccountDetail;
}

const LazyFallback = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 size={20} className="animate-spin text-[#1A3A52]/60" />
  </div>
);

export const AccountDetailTabs = ({ account }: AccountDetailTabsProps) => {
  const [activeTab, setActiveTab] = useState<ActiveTabKey>("general");
  const t = useTranslations("Account.Detail.tabs");

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => setActiveTab(v as ActiveTabKey)}
      orientation="vertical"
      className="flex flex-1 min-h-0 flex-col gap-0 md:flex-row md:gap-4"
    >
      {/* Vertical tab triggers (left side on desktop, top on mobile) */}
      <TabsList
        variant="line"
        className={cn(
          "shrink-0 rounded-lg p-1.5 h-auto bg-[#D5BA98]/10 border border-[#D5BA98]/30",
          // Desktop: vertical sidebar
          "md:flex-col md:w-48 md:h-full! md:items-stretch md:justify-start md:gap-0.5 md:self-stretch md:overflow-y-auto",
          // Mobile: horizontal scrollable
          "flex-row overflow-x-auto md:overflow-visible gap-1"
        )}
      >
        {TAB_CONFIG.map(({ key, labelKey, icon: Icon }) => (
          <TabsTrigger
            key={key}
            value={key}
            className={cn(
              "text-xs font-medium gap-2 px-3 py-2.5 rounded-md whitespace-nowrap transition-colors",
              "justify-start text-left",
            )}
          >
            <Icon size={14} />
            <span className="hidden sm:inline">{t(labelKey)}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      {/* Tab content (right side) */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden p-2">
        <TabsContent value="general" className="mt-0 min-h-0 overflow-y-auto">
          <GeneralTab account={account} />
        </TabsContent>

        <TabsContent value="role-status" className="mt-0 min-h-0 overflow-y-auto">
          <RoleStatusTab account={account} />
        </TabsContent>

        <TabsContent value="security" className="mt-0 min-h-0 overflow-y-auto">
          <SecurityTab account={account} />
        </TabsContent>

        <TabsContent value="orders" className="mt-0 min-h-0 flex flex-col">
          <Suspense fallback={<LazyFallback />}>
            <OrdersTab accountId={account.accountId} />
          </Suspense>
        </TabsContent>

        <TabsContent value="inventory" className="mt-0 min-h-0 flex flex-col">
          <Suspense fallback={<LazyFallback />}>
            <InventoryTab accountId={account.accountId} />
          </Suspense>
        </TabsContent>

        <TabsContent value="service-errors" className="mt-0 min-h-0 flex flex-col">
          <Suspense fallback={<LazyFallback />}>
            <ServiceErrorsTab accountId={account.accountId} />
          </Suspense>
        </TabsContent>

        <TabsContent value="audit-logs" className="mt-0 min-h-0 flex flex-col">
          <Suspense fallback={<LazyFallback />}>
            <AuditLogsTab accountId={account.accountId} />
          </Suspense>
        </TabsContent>
      </div>
    </Tabs>
  );
};
