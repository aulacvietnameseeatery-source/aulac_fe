"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ALCombobox } from "@/components/ui/al-combobox";
import { KeywordSearch } from "@/components/ui/keyword-search/keyword-search";
import { Card, CardContent } from "@/components/ui/card";
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

const TYPE_OPTIONS = [
  { label: "All Types", value: "ALL" },
  ...ALL_TYPES.map((t) => ({ label: TABLE_TYPE_LABELS[t], value: t as string })),
];

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "ALL" },
  ...ALL_STATUSES.map((s) => ({ label: TABLE_STATUS_CONFIG[s].label, value: s as string })),
];

const ONLINE_OPTIONS = [
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
          <KeywordSearch
            value={filters.search}
            placeholder="Search table code ..."
            onChange={(val) => updateFilter("search", val)}
            className="grow max-w-xs"
          />

          <ALCombobox
            options={TYPE_OPTIONS}
            value={filters.type}
            onChange={(val) => updateFilter("type", val as TableFilters["type"])}
            placeholder="Type"
            searchable={false}
            clearable
            inputSize="sm"
            wrapperClassName="w-40"
          />

          <ALCombobox
            options={STATUS_OPTIONS}
            value={filters.status}
            onChange={(val) => updateFilter("status", val as TableFilters["status"])}
            placeholder="Status"
            searchable={false}
            clearable
            inputSize="sm"
            wrapperClassName="w-44"
          />

          <ALCombobox
            options={ONLINE_OPTIONS}
            value={filters.isOnline}
            onChange={(val) => updateFilter("isOnline", val as TableFilters["isOnline"])}
            placeholder="Connection"
            searchable={false}
            clearable
            inputSize="sm"
            wrapperClassName="w-36"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterBar;
