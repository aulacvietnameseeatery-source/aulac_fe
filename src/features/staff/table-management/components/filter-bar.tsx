"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import type { TableFilters, TableZone } from "../types";
import { TABLE_ZONE_LABELS } from "../types";
import { ALL_TYPES, ALL_STATUSES } from "../data";
import { TABLE_TYPE_LABELS, TABLE_STATUS_CONFIG } from "../types";

interface FilterBarProps {
  filters: TableFilters;
  onFiltersChange: (filters: TableFilters) => void;
}

const ZONE_TABS: { value: TableZone | "ALL"; label: string }[] = [
  { value: "ALL", label: "All Zones" },
  ...Object.entries(TABLE_ZONE_LABELS).map(([key, label]) => ({
    value: key as TableZone,
    label,
  })),
];

const TYPE_SELECT_OPTIONS = [
  { label: "All Types", value: "ALL" },
  ...ALL_TYPES.map((t) => ({ label: TABLE_TYPE_LABELS[t], value: t as string })),
];

const STATUS_SELECT_OPTIONS = [
  { label: "All Statuses", value: "ALL" },
  ...ALL_STATUSES.map((s) => ({ label: TABLE_STATUS_CONFIG[s].label, value: s as string })),
];

const ONLINE_SELECT_OPTIONS = [
  { label: "All", value: "ALL" },
  { label: "Online", value: "ONLINE" },
  { label: "Offline", value: "OFFLINE" },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFiltersChange,
}) => {
  const updateFilter = <K extends keyof TableFilters>(
    key: K,
    value: TableFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card className="py-0 gap-0">
      <CardContent className="p-4 space-y-3">
        {/* Zone Tabs */}
        <Tabs
          value={filters.zone}
          onValueChange={(val) => updateFilter("zone", val as TableZone | "ALL")}
        >
          <TabsList variant="line">
            {ZONE_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="text-sm">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Secondary filters row */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative grow max-w-xs">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <Input
              placeholder="Search table code ..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>

          <Select
            value={filters.type}
            options={TYPE_SELECT_OPTIONS}
            onChange={(val) => updateFilter("type", val as TableFilters["type"])}
            placeholder="Type"
            className="h-9 w-36 text-sm"
          />

          <Select
            value={filters.status}
            options={STATUS_SELECT_OPTIONS}
            onChange={(val) => updateFilter("status", val as TableFilters["status"])}
            placeholder="Status"
            className="h-9 w-40 text-sm"
          />

          <Select
            value={filters.isOnline}
            options={ONLINE_SELECT_OPTIONS}
            onChange={(val) => updateFilter("isOnline", val as TableFilters["isOnline"])}
            placeholder="Connection"
            className="h-9 w-32 text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterBar;
