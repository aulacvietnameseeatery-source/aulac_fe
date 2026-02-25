"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card";
import type { RestaurantTable, TableStatus, TableZone } from "../types";
import { TABLE_ZONE_LABELS } from "../types";
import TableCard from "./table-card";

interface ZoneSectionProps {
  zone: TableZone;
  tables: RestaurantTable[];
  onEdit: (table: RestaurantTable) => void;
  onDelete: (table: RestaurantTable) => void;
  onSelect?: (table: RestaurantTable) => void;
  onStatusChange?: (tableId: number, status: TableStatus) => void;
}

const ZONE_SUBTITLES: Record<TableZone, string> = {
  INDOOR: "Main dining area",
  OUTDOOR: "Al fresco seating",
  ROOFTOP: "Upper-level terrace",
  PATIO: "Covered patio area",
  VIP_ROOM: "Private dining rooms",
};

export const ZoneSection: React.FC<ZoneSectionProps> = ({
  zone,
  tables,
  onEdit,
  onDelete,
  onSelect,
  onStatusChange,
}) => {
  if (tables.length === 0) return null;

  const available = tables.filter((t) => t.status === "AVAILABLE").length;

  return (
    <Card className="py-0 gap-0">
      <CardHeader className="px-5 pt-5 pb-4 border-b border-gray-100">
        <div>
          <CardTitle className="text-xl font-semibold text-gray-800">
            {TABLE_ZONE_LABELS[zone]}
          </CardTitle>
          <p className="text-xs text-gray-400 mt-0.5">{ZONE_SUBTITLES[zone]}</p>
        </div>
        <CardAction>
          <span className="text-xs text-gray-500">
            {available} of {tables.length} available
          </span>
        </CardAction>
      </CardHeader>
      <CardContent className="p-5">
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
      </CardContent>
    </Card>
  );
};

export default ZoneSection;
