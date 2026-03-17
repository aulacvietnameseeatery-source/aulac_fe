"use client";

import { useTranslations } from "next-intl";
import { BarChart2, RefreshCcw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALDatePicker } from "@/components/ui/al-date-picker";
import { ALCombobox } from "@/components/ui/al-combobox";
import { type FiltersState, thisMonthRange } from "./report-shared";

interface ReportHeaderProps {
  filters: FiltersState;
  isLoading: boolean;
  onChange: (f: FiltersState) => void;
  onRefetch: () => void;
  onExportCsv: () => void;
}

const PRESETS = [
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
    key: "thisMonth",
    get: (): { from: string; to: string } => {
      const r = thisMonthRange();
      return { from: r.from, to: r.to };
    },
  },
];

export function ReportHeader({ filters, isLoading, onChange, onRefetch, onExportCsv }: ReportHeaderProps) {
  const t = useTranslations("ShiftManagement.Reports");
  
  function isActive(preset: (typeof PRESETS)[number]) {
    const { from, to } = preset.get();
    return filters.fromDate === from && filters.toDate === to;
  }

  const quickTimeOptions = PRESETS.map((p) => ({
    value: p.key,
    label: t(`presets.${p.key}` as Parameters<typeof t>[0]),
  }));
  const activeQuickTime = PRESETS.find((p) => isActive(p))?.key ?? "";

  return (
    <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 rounded-xl border border-[#D5BA98]/60 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A3A52]/8 shrink-0">
          <BarChart2 className="h-5 w-5 text-[#1A3A52]" />
        </div>
        <div>
          <h1
            className="text-2xl font-semibold tracking-wide text-[#1A3A52]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {t("title")}
          </h1>
          <p className="text-xs text-[#1A3A52]/55 mt-0.5">Summary, compliance, and tracked hours.</p>
        </div>
      </div>

      <div className="flex flex-wrap flex-1 w-full xl:w-auto xl:justify-end items-center gap-3 shrink-0">
        <ALCombobox
          options={quickTimeOptions}
          value={activeQuickTime}
          onChange={(val) => {
            const preset = PRESETS.find((p) => p.key === String(val));
            if (!preset) return;
            const { from, to } = preset.get();
            onChange({ fromDate: from, toDate: to });
          }}
          placeholder={t("selectDateRange")}
          inputSize="sm"
          wrapperClassName="w-[160px]"
        />

        <div className="flex items-center gap-2">
          <ALDatePicker
            value={filters.fromDate}
            onChange={(val) => onChange({ ...filters, fromDate: val })}
            placeholder={t("filters.fromDate")}
            clearable
            inputSize="sm"
            wrapperClassName="w-[150px]"
          />
          <span className="text-[#1A3A52]/40 text-xs">—</span>
          <ALDatePicker
            value={filters.toDate}
            onChange={(val) => onChange({ ...filters, toDate: val })}
            placeholder={t("filters.toDate")}
            clearable
            inputSize="sm"
            wrapperClassName="w-[150px]"
          />
        </div>

        <div className="flex items-center gap-2 border-l border-[#D5BA98]/30 pl-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefetch}
            disabled={isLoading}
            className="border-none bg-slate-50 text-[#1A3A52] hover:bg-slate-100 h-8 w-8 p-0"
            title={t("refresh")}
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onExportCsv}
            className="border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 hover:border-emerald-700 h-8 text-xs gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            {t("exportCsv")}
          </Button>
        </div>
      </div>
    </div>
  );
}
