"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ALDatePicker } from "@/components/ui/al-date-picker";
import { type FiltersState, thisMonthRange } from "./report-shared";

interface FilterBarProps {
  filters: FiltersState;
  onChange: (f: FiltersState) => void;
}

const PRESETS = [
  {
    key: "today",
    get: (): { from: string; to: string } => {
      const d = new Date().toISOString().slice(0, 10);
      return { from: d, to: d };
    },
  },
  {
    key: "thisWeek",
    get: (): { from: string; to: string } => {
      const now = new Date();
      const day = now.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      const from = new Date(now);
      from.setDate(now.getDate() + diff);
      return {
        from: from.toISOString().slice(0, 10),
        to: new Date().toISOString().slice(0, 10),
      };
    },
  },
  {
    key: "last7Days",
    get: (): { from: string; to: string } => ({
      from: new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10),
      to: new Date().toISOString().slice(0, 10),
    }),
  },
  {
    key: "thisMonth",
    get: (): { from: string; to: string } => {
      const r = thisMonthRange();
      return { from: r.from, to: r.to };
    },
  },
  {
    key: "lastMonth",
    get: (): { from: string; to: string } => {
      const now = new Date();
      return {
        from: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10),
        to: new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0, 10),
      };
    },
  },
];

export function ReportFilterBar({ filters, onChange }: FilterBarProps) {
  const t = useTranslations("ShiftManagement.Reports");
  function isActive(preset: (typeof PRESETS)[number]) {
    const { from, to } = preset.get();
    return filters.fromDate === from && filters.toDate === to;
  }

  return (
    <div className="rounded-2xl border border border-[#D5BA98]/60 bg-white px-4 py-3 shadow-sm space-y-3">
      {/* Preset chips */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => {
              const { from, to } = p.get();
              onChange({ fromDate: from, toDate: to });
            }}
            className={cn(
              "rounded-full px-3.5 py-1 text-xs font-medium border transition-all",
              isActive(p)
                ? "bg-[#1A3A52] text-white border-[#1A3A52] shadow-sm"
                : "bg-white text-[#1A3A52]/65 border border-[#D5BA98]/60 hover:border-[#1A3A52]/40 hover:text-[#1A3A52]"
            )}
          >
            {t(`presets.${p.key}` as Parameters<typeof t>[0])}
          </button>
        ))}
      </div>

      {/* Date pickers */}
      <div className="flex flex-wrap gap-3">
        <ALDatePicker
          value={filters.fromDate}
          onChange={(val) => onChange({ ...filters, fromDate: val })}
          placeholder={t("filters.fromDate")}
          clearable
          title={t("filters.fromDate")}
          inputSize="sm"
          wrapperClassName="flex-1 min-w-[140px]"
        />
        <ALDatePicker
          value={filters.toDate}
          onChange={(val) => onChange({ ...filters, toDate: val })}
          placeholder={t("filters.toDate")}
          title={t("filters.toDate")}
          clearable
          inputSize="sm"
          wrapperClassName="flex-1 min-w-[140px]"
        />
      </div>
    </div>
  );
}
