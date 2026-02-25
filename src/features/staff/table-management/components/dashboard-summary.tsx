"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import type { RestaurantTable } from "../types";
import { TABLE_STATUS_CONFIG } from "../types";

interface DashboardSummaryProps {
  tables: RestaurantTable[];
}

interface SummaryItem {
  label: string;
  count: number;
  total: number;
  dotColor: string;
  textColor: string;
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({ tables }) => {
  const total = tables.length;

  const summary = useMemo<SummaryItem[]>(() => {
    const available = tables.filter((t) => t.status === "AVAILABLE").length;
    const occupied = tables.filter((t) => t.status === "OCCUPIED").length;
    const reserved = tables.filter((t) => t.status === "RESERVED").length;
    const cleaning = tables.filter((t) => t.status === "CLEANING").length;
    const outOfService = tables.filter((t) => t.status === "OUT_OF_SERVICE").length;
    const withErrors = tables.filter((t) => t.hasErrors).length;

    return [
      { ...TABLE_STATUS_CONFIG.AVAILABLE, label: "Available", count: available, total },
      { ...TABLE_STATUS_CONFIG.OCCUPIED, label: "Occupied", count: occupied, total },
      { ...TABLE_STATUS_CONFIG.RESERVED, label: "Reserved", count: reserved, total },
      { ...TABLE_STATUS_CONFIG.CLEANING, label: "Cleaning", count: cleaning, total },
      { ...TABLE_STATUS_CONFIG.OUT_OF_SERVICE, label: "Out of Service", count: outOfService, total },
      {
        label: "Errors",
        count: withErrors,
        total,
        dotColor: "bg-orange-500",
        textColor: "text-orange-700",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-300",
      },
    ];
  }, [tables, total]);

  return (
    <Card className="py-0 gap-0">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xl font-semibold text-gray-800">Overview</h4>
          <span className="text-xs text-gray-400">{total} total tables</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {summary.map((item) => (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className={cn("w-2 h-2 rounded-full shrink-0", item.dotColor)} />
                <span className="text-xs text-gray-500">{item.label}</span>
              </div>
              <p className={cn("text-2xl font-bold leading-none pl-4", item.textColor)}>
                {item.count}
              </p>
              <div className="pl-4">
                <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", item.dotColor)}
                    style={{ width: total > 0 ? `${(item.count / total) * 100}%` : "0%" }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardSummary;
