"use client";

import React from "react";
import { TABLE_STATUS_CONFIG } from "../types";
import { cn } from "@/lib/utils";

export const TableLegend: React.FC = () => {
  const statuses = Object.entries(TABLE_STATUS_CONFIG);

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500">
      {statuses.map(([key, config]) => (
        <div key={key} className="flex items-center gap-1.5">
          <span className={cn("w-2 h-2 rounded-full", config.dotColor)} />
          <span>{config.label}</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-orange-400" />
        <span>Error</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-gray-300 ring-1 ring-gray-300 ring-offset-1" />
        <span>Offline</span>
      </div>
    </div>
  );
};

export default TableLegend;
