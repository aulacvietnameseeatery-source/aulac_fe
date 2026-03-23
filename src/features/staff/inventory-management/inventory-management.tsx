"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { LayoutDashboard, Package, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ALCard } from "@/components/ui/al-card";
import { InventoryDashboard } from "./components/dashboard/inventory-dashboard";
import { InventoryItemsList } from "./components/items/inventory-items-list";
import { TransactionsList } from "./components/transactions/transactions-list";

type Tab = "dashboard" | "items" | "transactions";

const TABS: { key: Tab; icon: React.ReactNode; labelKey: string }[] = [
  { key: "dashboard", icon: <LayoutDashboard className="w-4 h-4" />, labelKey: "dashboard.title" },
  { key: "items", icon: <Package className="w-4 h-4" />, labelKey: "items.title" },
  { key: "transactions", icon: <ArrowLeftRight className="w-4 h-4" />, labelKey: "transactions.title" },
];

interface Props {
  defaultTab?: Tab;
}

export function InventoryManagement({ defaultTab = "dashboard" }: Props) {
  const t = useTranslations("inventory");
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);

  return (
    <div className="flex flex-col h-full">
      <ALCard variant="default" padding="none" elevation="sm" radius="xl" className="mb-4">
        {/* Tab bar */}
        <div className="border-b border-[#D5BA98]/30 bg-white rounded-xl">
          <div className="flex items-center gap-1 px-3 sm:px-4 pt-3 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex items-center gap-2 px-3 sm:px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap",
                  activeTab === tab.key
                    ? "bg-[#1A3A52] text-white"
                    : "text-[#1A3A52]/60 hover:text-[#1A3A52] hover:bg-[#D5BA98]/10",
                )}
              >
                {tab.icon}
                {t(tab.labelKey)}
              </button>
            ))}
          </div>
        </div>
      </ALCard>

      {/* Content */}
      <div className="flex-1 overflow-y-auto py-5 bg-[#FDFBF9]">
        {activeTab === "dashboard" && <InventoryDashboard />}
        {activeTab === "items" && <InventoryItemsList />}
        {activeTab === "transactions" && <TransactionsList />}
      </div>
    </div>
  );
}
