"use client";

import React from "react";
import { Settings } from "lucide-react";
import { useTranslations } from "next-intl";

export const SystemSettingsTab = () => {
  const t = useTranslations("Account.Detail");
  
  return (
    <div className="space-y-5">
      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
        {t("tabs.systemSettings")}
      </h4>
      <div className="p-8 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-center">
        <Settings size={32} className="mx-auto text-gray-300 mb-3" />
        <p className="text-sm text-gray-400 font-medium">{t("placeholders.noDataTitle.systemSettings")}</p>
        <p className="text-xs text-gray-300 mt-1">
          {t("placeholders.systemSettings")}
        </p>
      </div>
    </div>
  );
};
