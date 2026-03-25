"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface ShiftMatrixHeaderProps {
  weekDates: Date[];
}

function isToday(d: Date) {
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function fmtShort(d: Date) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function ShiftMatrixHeader({ weekDates }: ShiftMatrixHeaderProps) {
  const t = useTranslations("shift.schedule.matrix");
  const dayLabels = [
    t("days.mon"),
    t("days.tue"),
    t("days.wed"),
    t("days.thu"),
    t("days.fri"),
    t("days.sat"),
    t("days.sun"),
  ];

  return (
    <div className="grid grid-cols-[180px_repeat(7,1fr)] border-b border-[#D5BA98]/40 sticky top-0 z-10 bg-white">
      {/* Staff column label */}
      <div className="flex items-end px-3 py-2">
        <span className="text-xs font-medium text-[#1A3A52]/60 uppercase tracking-wider">
          {t("staff")}
        </span>
      </div>

      {/* Day columns */}
      {weekDates.map((d, i) => (
        <div
          key={i}
          className={cn(
            "flex flex-col items-center justify-end gap-0.5 px-1 py-2 text-center",
            isToday(d) && "bg-[#1A3A52]/5 rounded-t-md"
          )}
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#1A3A52]/50">
            {dayLabels[i]}
          </span>
          <span
            className={cn(
              "text-sm font-medium",
              isToday(d)
                ? "rounded-full bg-[#1A3A52] px-2 py-0.5 text-white"
                : "text-[#1A3A52]"
            )}
          >
            {fmtShort(d)}
          </span>
        </div>
      ))}
    </div>
  );
}
