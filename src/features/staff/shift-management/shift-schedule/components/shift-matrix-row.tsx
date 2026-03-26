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
  selectedCells?: Set<string>;
  onCardClick?: (a: ShiftAssignmentListDto) => void;
  onAddClick?: (staffId: number, date: string) => void;
  onCellMouseDown?: (staffId: number, date: string) => void;
  onCellMouseEnter?: (staffId: number, date: string) => void;
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
  selectedCells,
  onCardClick,
  onAddClick,
  onCellMouseDown,
  onCellMouseEnter,
}: ShiftMatrixRowProps) {
  // Index assignments by workDate for O(1) lookup
  const byDate = new Map<string, ShiftAssignmentListDto[]>();
  const assignments = staff?.assignments ?? [];
  for (const a of assignments) {
    const key = a.workDate.slice(0, 10);
    const arr = byDate.get(key);
    if (arr) arr.push(a);
    else byDate.set(key, [a]);
  }

  const colCount = weekDates.length;
  const gridStyle = { gridTemplateColumns: `180px repeat(${colCount}, minmax(120px, 1fr))` };

  return (
    <div
      className={cn(
        "border-b border-[#D5BA98]/15",
        isEven ? "bg-white" : "bg-[#FDFBF9]"
      )}
      style={{ display: "grid", ...gridStyle }}
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
            isSelected={selectedCells?.has(cellId)}
            onCardClick={onCardClick}
            onAddClick={onAddClick ? () => onAddClick(staff.staffId, dateStr) : undefined}
            onMouseDown={onCellMouseDown ? () => onCellMouseDown(staff.staffId, dateStr) : undefined}
            onMouseEnter={onCellMouseEnter ? () => onCellMouseEnter(staff.staffId, dateStr) : undefined}
          />
        );
      })}
    </div>
  );
}
