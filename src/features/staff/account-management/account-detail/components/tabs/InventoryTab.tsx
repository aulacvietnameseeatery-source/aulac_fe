"use client";

import React from "react";
import { Package } from "lucide-react";
import { useTranslations } from "next-intl";

export const InventoryTab = () => {
  const t = useTranslations("Account.Detail");
  
  return (
    <div className="space-y-5">
      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
        {t("tabs.inventory")}
      </h4>
      <div className="p-8 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-center">
        <Package size={32} className="mx-auto text-gray-300 mb-3" />
        <p className="text-sm text-gray-400 font-medium">{t("placeholders.noDataTitle.inventory")}</p>
        <p className="text-xs text-gray-300 mt-1">
          {t("placeholders.inventory")}
        </p>
      </div>
    </div>
  );
};
