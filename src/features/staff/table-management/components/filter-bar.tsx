"use client";

import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ALCombobox } from "@/components/ui/al-combobox";
import { KeywordSearch } from "@/components/ui/keyword-search/keyword-search";
import { Card, CardContent } from "@/components/ui/card";
import type { TableFilters, TableStatus } from "../types";
import { TABLE_STATUS_CONFIG, TABLE_STATUS_LV_IDS } from "../types";
import {
  useZonesQuery,
  useTableTypesQuery,
} from "../hooks/use-table-queries";

interface FilterBarProps {
  filters: TableFilters;
  onFiltersChange: (filters: TableFilters) => void;
}

// ── Status options (statuses are always the 4 fixed statuses) ──
const ALL_STATUSES = Object.keys(TABLE_STATUS_CONFIG) as Array<
  keyof typeof TABLE_STATUS_CONFIG
>;

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFiltersChange,
}) => {
  const t = useTranslations("tableManagement");
  // ── Fetch lookup data ──
  const { data: zones = [] } = useZonesQuery();
  const { data: tableTypes = [] } = useTableTypesQuery();

  const statusLabelMap = useMemo(
    () => ({
      AVAILABLE: t("status.available"),
      OCCUPIED: t("status.occupied"),
      RESERVED: t("status.reserved"),
      LOCKED: t("status.locked"),
    }),
    [t]
  );

  const statusOptions = useMemo(
    () => [
      { label: t("filters.allStatuses"), value: "ALL" },
      ...ALL_STATUSES.map((s) => ({
        label: statusLabelMap[s],
        value: s as string,
      })),
    ],
    [statusLabelMap, t]
  );

  const onlineOptions = useMemo(
    () => [
      { label: t("filters.all"), value: "ALL" },
      { label: t("filters.online"), value: "ONLINE" },
      { label: t("filters.offline"), value: "OFFLINE" },
    ],
    [t]
  );

  // ── Zone tabs (dynamic from API) ──
  const zoneTabs = useMemo(() => {
    const dynamic = zones.map((z) => ({
      key: String(z.valueId),
      value: z.valueName,
      label: z.valueName,
      zoneId: z.valueId,
    }));
    return [{ key: "all", value: "ALL", label: t("filters.allZones"), zoneId: null as number | null }, ...dynamic];
  }, [zones, t]);

  // ── Type options (dynamic from API) ──
  const typeOptions = useMemo(() => {
    const dynamic = tableTypes.map((t) => ({
      label: t.valueName,
      value: t.valueName,
      typeId: t.valueId,
    }));
    return [{ label: t("filters.allTypes"), value: "ALL", typeId: null as number | null }, ...dynamic];
  }, [tableTypes, t]);

  const handleZoneChange = (val: string) => {
    const tab = zoneTabs.find((t) => t.value === val);
    onFiltersChange({
      ...filters,
      zone: val,
      zoneId: tab?.zoneId ?? null,
    });
  };

  const handleTypeChange = (val: string) => {
    const opt = typeOptions.find((t) => t.value === val);
    onFiltersChange({
      ...filters,
      type: val,
      typeId: opt?.typeId ?? null,
    });
  };

  const handleStatusChange = (val: string) => {
    onFiltersChange({
      ...filters,
      status: val,
      statusId: val !== "ALL" ? (TABLE_STATUS_LV_IDS[val as TableStatus] ?? null) : null,
    });
  };

  return (
    <Card className="gap-0 border-[#D5BA98]/50 bg-[#FDFBF9] py-0 shadow-none">
      <CardContent className="p-4 space-y-3">
        {/* Zone Tabs */}
        <Tabs value={filters.zone} onValueChange={handleZoneChange}>
          <TabsList variant="line" className="border-b border-[#D5BA98]/60 bg-transparent">
            {zoneTabs.map((tab) => (
              <TabsTrigger
                key={tab.key}
                value={tab.value}
                className="text-sm text-[#1A3A52]/75 data-[state=active]:text-[#1A3A52]"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Secondary filters row */}
        <div className="flex flex-wrap items-center gap-3">
          <KeywordSearch
            value={filters.search}
            placeholder={t("filters.searchPlaceholder")}
            onChange={(val) =>
              onFiltersChange({ ...filters, search: val })
            }
            className="grow max-w-xs"
          />

          <ALCombobox
            options={typeOptions}
            value={filters.type}
            onChange={(val) => handleTypeChange(String(val))}
            placeholder={t("filters.type")}
            searchable={false}
            clearable
            inputSize="sm"
            wrapperClassName="w-40"
          />

          <ALCombobox
            options={statusOptions}
            value={filters.status}
            onChange={(val) => handleStatusChange(String(val))}
            placeholder={t("filters.status")}
            searchable={false}
            clearable
            inputSize="sm"
            wrapperClassName="w-44"
          />

          <ALCombobox
            options={onlineOptions}
            value={filters.isOnline}
            onChange={(val) =>
              onFiltersChange({
                ...filters,
                isOnline: val as TableFilters["isOnline"],
              })
            }
            placeholder={t("filters.connection")}
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
