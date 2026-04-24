"use client";

import { useTranslations } from "next-intl";
import { BarChart2, RefreshCcw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALDatePicker } from "@/components/ui/al-date-picker";
import { ALCombobox } from "@/components/ui/al-combobox";
import { ALTitleCard } from "@/components/ui/al-title-card";
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
    <ALTitleCard
      animation="slide-up"
      title={
        <span className="inline-flex min-w-0 items-center gap-2.5">
          <span className="truncate">{t("title")}</span>
        </span>
      }
      description={t("description")}
      descriptionClassName="text-[11px] text-[#1A3A52]/55 sm:text-xs"
      headerClassName="xl:items-center"
      className="px-3 py-2.5 sm:px-4 sm:py-3"
      actions={
        <div className="flex w-full items-center gap-2 min-[430px]:w-auto">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
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

            <div className="flex w-full items-center gap-1.5 sm:gap-2 min-[560px]:w-auto">
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
          </div>
          
          <Button
            size="sm"
            variant="outline"
            onClick={onExportCsv}
            className="h-8 flex-1 gap-1.5 border-emerald-600 bg-emerald-600 text-xs text-white hover:border-emerald-700 hover:bg-emerald-700 min-[430px]:flex-none"
          >
            <Download className="h-3.5 w-3.5" />
            {t("exportCsv")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefetch}
            disabled={isLoading}
            className="h-8 w-8 border-none bg-slate-50 p-0 text-[#1A3A52] hover:bg-slate-100"
            title={t("refresh")}
          >
            <RefreshCcw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      }
    >

    </ALTitleCard>
  );
}
