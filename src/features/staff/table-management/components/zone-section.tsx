"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  Wifi,
  WifiOff,
  Users,
} from "lucide-react";
import type { RestaurantTable, TableStatus } from "../types";
import { TABLE_STATUS_CONFIG } from "../types";
import TableCard from "./table-card";

interface ZoneSectionProps {
  zone: string;
  tables: RestaurantTable[];
  collapsed?: boolean;
  onToggleCollapse?: (zone: string) => void;
  onToggleZoneOnline?: (zoneId: number, online: boolean) => void;
  maxHeight?: number;
  onEdit: (table: RestaurantTable) => void;
  onDelete: (table: RestaurantTable) => void;
  onSelect?: (table: RestaurantTable) => void;
  onStatusChange?: (tableId: number, status: TableStatus) => void;
}

const ZONE_SUBTITLES: Record<string, string> = {
  Indoor: "Main dining area",
  Outdoor: "Al fresco seating",
  Rooftop: "Upper-level terrace",
};

export const ZoneSection: React.FC<ZoneSectionProps> = ({
  zone,
  tables,
  collapsed = false,
  onToggleCollapse,
  onToggleZoneOnline,
  maxHeight = 520,
  onEdit,
  onDelete,
  onSelect,
  onStatusChange,
}) => {
  const stats = useMemo(() => {
    const available = tables.filter((t) => t.status === "AVAILABLE").length;
    const occupied = tables.filter((t) => t.status === "OCCUPIED").length;
    const reserved = tables.filter((t) => t.status === "RESERVED").length;
    const online = tables.filter((t) => t.isOnline).length;
    const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);
    const activeOrders = tables.reduce((sum, t) => sum + t.activeOrders, 0);
    const errors = tables.filter((t) => t.hasErrors).length;
    return { available, occupied, reserved, online, totalCapacity, activeOrders, errors };
  }, [tables]);

  if (tables.length === 0) return null;

  const allOnline = stats.online === tables.length;

  return (
    <Card className="py-0 gap-0">
      <CardHeader
        className={cn(
          "px-5 pt-4 pb-3 border-b border-gray-100 cursor-pointer select-none transition-colors hover:bg-gray-50/50",
          collapsed && "border-b-0"
        )}
        onClick={() => onToggleCollapse?.(zone)}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Zone icon */}
          <div className="min-w-0">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              {zone}
              <span className="text-xs font-normal text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
                {tables.length}
              </span>
            </CardTitle>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {ZONE_SUBTITLES[zone] ?? zone}
            </p>
          </div>
        </div>

        <CardAction>
          <div
            className="flex items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Zone stats pills */}
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-gray-500">
              <span className="flex items-center gap-1">
                <span className={cn("w-1.5 h-1.5 rounded-full", TABLE_STATUS_CONFIG.AVAILABLE.dotColor)} />
                {stats.available} avail
              </span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1">
                <Users size={11} />
                {stats.totalCapacity} seats
              </span>
              {stats.activeOrders > 0 && (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="flex items-center gap-1 text-blue-600">
                    {stats.activeOrders} order{stats.activeOrders !== 1 ? "s" : ""}
                  </span>
                </>
              )}
              {stats.errors > 0 && (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="flex items-center gap-1 text-orange-500">
                    {stats.errors} error{stats.errors !== 1 ? "s" : ""}
                  </span>
                </>
              )}
            </div>

            {/* Zone online/offline toggle */}
            {onToggleZoneOnline && (
              <Button
                variant={"ghost"}
                size="icon"
                className={cn(
                  "size-7",
                  allOnline ? "text-emerald-600" : "text-gray-400"
                )}
                data-tooltip-content={allOnline ? "Set zone offline" : "Set zone online"}
                data-tooltip-id="my-tooltip"
                onClick={() => onToggleZoneOnline(tables[0]?.zoneId ?? 0, !allOnline)}
              >
                {allOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
              </Button>
            )}

            {/* Collapse toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-gray-400"
              onClick={() => onToggleCollapse?.(zone)}
            >
              {collapsed ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronUp size={16} />
              )}
            </Button>
          </div>
        </CardAction>
      </CardHeader>

      {/* Collapsible content */}
      {!collapsed && (
        <CardContent className="p-5">
          {/* Inline mini status bar for zone */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-1.5 flex-1 rounded-full overflow-hidden bg-gray-100">
              {([
                { count: stats.available, color: TABLE_STATUS_CONFIG.AVAILABLE.dotColor },
                { count: stats.occupied, color: TABLE_STATUS_CONFIG.OCCUPIED.dotColor },
                { count: stats.reserved, color: TABLE_STATUS_CONFIG.RESERVED.dotColor },
                { count: tables.filter((t) => t.status === "LOCKED").length, color: TABLE_STATUS_CONFIG.LOCKED.dotColor },
              ] as const)
                .filter((seg) => seg.count > 0)
                .map((seg, idx) => (
                  <div
                    key={idx}
                    className={cn("h-full transition-all duration-300", seg.color)}
                    style={{ width: `${(seg.count / tables.length) * 100}%` }}
                  />
                ))}
            </div>
            <span className="text-[10px] text-gray-400 shrink-0 whitespace-nowrap">
              {stats.available}/{tables.length} available
            </span>
          </div>

          {/* Table grid with max height scroll */}
          <div
            className="overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300"
            style={{ maxHeight: `${maxHeight}px` }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {tables.map((table) => (
                <TableCard
                  key={table.tableId}
                  table={table}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onSelect={onSelect}
                  onStatusChange={onStatusChange}
                />
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ZoneSection;
