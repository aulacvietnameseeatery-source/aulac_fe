"use client";

import { cn } from "@/lib/utils";
import { ShiftMatrixCell } from "./shift-matrix-cell";
import type {
  ShiftAssignmentListDto,
  TeamScheduleStaffRow,
} from "../../types/shift-management.types";

interface ShiftMatrixRowProps {
  staff: TeamScheduleStaffRow;
  weekDates: Date[];
  conflictIds?: Set<number>;
  isEven?: boolean;
  onCardClick?: (a: ShiftAssignmentListDto) => void;
  onAddClick?: (staffId: number, date: string) => void;
}

function fmtDate(d: Date) {
  return d.toISOString().slice(0, 10); // yyyy-MM-dd
}

function isToday(d: Date) {
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function ShiftMatrixRow({
  staff,
  weekDates,
  conflictIds,
  isEven,
  onCardClick,
  onAddClick,
}: ShiftMatrixRowProps) {
  // Index assignments by workDate for O(1) lookup
  const byDate = new Map<string, ShiftAssignmentListDto[]>();
  for (const a of staff.assignments) {
    const key = a.workDate.slice(0, 10);
    const arr = byDate.get(key);
    if (arr) arr.push(a);
    else byDate.set(key, [a]);
  }

  return (
    <div
      className={cn(
        "grid grid-cols-[180px_repeat(7,1fr)] border-b border-[#D5BA98]/15",
        isEven ? "bg-white" : "bg-[#FDFBF9]"
      )}
    >
      {/* Staff info column */}
      <div className="flex flex-col justify-center px-3 py-2 border-r border-[#D5BA98]/20">
        <span className="text-sm font-medium text-[#1A3A52] truncate">
          {staff.staffName}
        </span>
        <span className="text-[10px] text-[#1A3A52]/50 truncate">
          {staff.roleName}
        </span>
      </div>

      {/* 7 day cells */}
      {weekDates.map((d) => {
        const dateStr = fmtDate(d);
        const cellId = `${staff.staffId}-${dateStr}`;
        return (
          <ShiftMatrixCell
            key={cellId}
            cellId={cellId}
            assignments={byDate.get(dateStr) ?? []}
            isToday={isToday(d)}
            conflictIds={conflictIds}
            onCardClick={onCardClick}
            onAddClick={onAddClick ? () => onAddClick(staff.staffId, dateStr) : undefined}
          />
        );
      })}
    </div>
  );
}
