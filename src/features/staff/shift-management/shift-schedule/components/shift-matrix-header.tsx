"use client";

import { cn } from "@/lib/utils";

interface ShiftMatrixHeaderProps {
  weekDates: Date[];
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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
  return (
    <div className="grid grid-cols-[180px_repeat(7,1fr)] border-b border-[#D5BA98]/40">
      {/* Staff column label */}
      <div className="flex items-end px-3 py-2">
        <span className="text-xs font-medium text-[#1A3A52]/60 uppercase tracking-wider">
          Staff
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
            {DAY_LABELS[i]}
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
