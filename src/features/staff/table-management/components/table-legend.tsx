"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { TABLE_STATUS_CONFIG } from "../types";
import { cn } from "@/lib/utils";

export const TableLegend: React.FC = () => {
  const t = useTranslations("tableManagement");
  const statuses = Object.entries(TABLE_STATUS_CONFIG);

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500">
      {statuses.map(([key, config]) => (
        <div key={key} className="flex items-center gap-1.5">
          <span className={cn("w-2 h-2 rounded-full", config.dotColor)} />
          <span>{t(`status.${key.toLowerCase()}`)}</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-orange-400" />
        <span>{t("states.error")}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-gray-300 ring-1 ring-gray-300 ring-offset-1" />
        <span>{t("filters.offline")}</span>
      </div>
    </div>
  );
};

export default TableLegend;
