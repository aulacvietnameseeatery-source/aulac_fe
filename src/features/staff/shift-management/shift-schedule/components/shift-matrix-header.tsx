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

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

export function ShiftMatrixHeader({ weekDates }: ShiftMatrixHeaderProps) {
  const t = useTranslations("shift.schedule.matrix");

  return (
    <thead className="sticky top-0 z-20 bg-white">
      <tr className="border-b border-[#D5BA98]/40">
        {/* Staff column label — sticky left + top corner */}
        <th
          className="sticky left-0 z-30 bg-white text-left px-3 py-2 min-w-[180px] w-[180px] border-r border-[#D5BA98]/20"
        >
          <span className="text-xs font-medium text-[#1A3A52]/60 uppercase tracking-wider">
            {t("staff")}
          </span>
        </th>

        {/* Day columns */}
        {weekDates.map((d, i) => (
          <th
            key={i}
            className={cn(
              "px-1 py-2 text-center min-w-[120px] font-normal",
              isToday(d) && "bg-[#1A3A52]/5"
            )}
          >
            <div className="flex flex-col items-center justify-end gap-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#1A3A52]/50">
                {t(`days.${DAY_KEYS[d.getDay()]}`)}
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
          </th>
        ))}
      </tr>
    </thead>
  );
}
