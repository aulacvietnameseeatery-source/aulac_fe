"use client";

import { useTranslations } from "next-intl";
import { BarChart2, RefreshCcw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALDatePicker } from "@/components/ui/al-date-picker";
import { ALCombobox } from "@/components/ui/al-combobox";
import { ALCard } from "@/components/ui/al-card";
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
  const t = useTranslations("shift.reports");
  
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
    <ALCard animation="slide-up" className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-2.5 sm:gap-3 px-3 py-2.5 sm:px-4 sm:py-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-[#1A3A52]/8 shrink-0">
          <BarChart2 className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-[#1A3A52]" />
        </div>
        <div className="min-w-0">
          <h1
            className="text-lg sm:text-xl font-semibold tracking-wide text-[#1A3A52] leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {t("title")}
          </h1>
          <p className="text-[11px] sm:text-xs text-[#1A3A52]/55 mt-0.5 truncate sm:whitespace-normal">{t("description")}</p>
        </div>
      </div>

      <div className="flex flex-wrap flex-1 w-full xl:w-auto xl:justify-end items-center gap-2 sm:gap-2.5 shrink-0">
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
          wrapperClassName="w-full min-[430px]:w-[165px]"
        />

        <div className="flex items-center gap-1.5 sm:gap-2 w-full min-[560px]:w-auto">
          <ALDatePicker
            value={filters.fromDate}
            onChange={(val) => onChange({ ...filters, fromDate: val })}
            placeholder={t("filters.fromDate")}
            clearable
            inputSize="sm"
            wrapperClassName="w-full min-[560px]:w-[145px]"
          />
          <span className="text-[#1A3A52]/40 text-xs shrink-0">—</span>
          <ALDatePicker
            value={filters.toDate}
            onChange={(val) => onChange({ ...filters, toDate: val })}
            placeholder={t("filters.toDate")}
            clearable
            inputSize="sm"
            wrapperClassName="w-full min-[560px]:w-[145px]"
          />
        </div>

        <div className="flex items-center gap-2 w-full min-[430px]:w-auto border-t min-[430px]:border-t-0 min-[430px]:border-l border-[#D5BA98]/30 pt-2 min-[430px]:pt-0 min-[430px]:pl-2.5">
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
            className="border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 hover:border-emerald-700 h-8 text-xs gap-1.5 flex-1 min-[430px]:flex-none"
          >
            <Download className="w-3.5 h-3.5" />
            {t("exportCsv")}
          </Button>
        </div>
      </div>
    </ALCard>
  );
}
