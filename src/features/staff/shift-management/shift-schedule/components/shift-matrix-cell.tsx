"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShiftCard } from "../../components/shift-card";
import type { ShiftAssignmentListDto } from "../../types/shift-management.types";

interface ShiftMatrixCellProps {
  /** Composite id: "staffId-yyyy-MM-dd" */
  cellId: string;
  assignments: ShiftAssignmentListDto[];
  isToday?: boolean;
  conflictIds?: Set<number>;
  onCardClick?: (a: ShiftAssignmentListDto) => void;
  onAddClick?: () => void;
}

export function ShiftMatrixCell({
  cellId,
  assignments,
  isToday = false,
  conflictIds,
  onCardClick,
  onAddClick,
}: ShiftMatrixCellProps) {
  const { isOver, setNodeRef } = useDroppable({ id: cellId });

  const sortableIds = assignments.map(
    (a) => `assignment-${a.shiftAssignmentId}`
  );

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "group/cell relative min-h-[64px] border-l border-[#D5BA98]/20 px-1 py-1 transition-colors",
        isToday && "bg-[#1A3A52]/[0.03]",
        isOver && "bg-blue-50/60 ring-1 ring-inset ring-blue-300"
      )}
    >
      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-1">
          {assignments.map((a) => (
            <ShiftCard
              key={a.shiftAssignmentId}
              assignment={a}
              hasConflict={conflictIds?.has(a.shiftAssignmentId)}
              onClick={onCardClick}
            />
          ))}
        </div>
      </SortableContext>

      {/* Quick-add button — appears on hover when cell is empty or has room */}
      {onAddClick && (
        <button
          type="button"
          onClick={onAddClick}
          className={cn(
            "absolute inset-x-1 bottom-1 flex items-center justify-center gap-1 rounded border border-dashed border-[#D5BA98]/40 py-0.5 text-[10px] text-[#1A3A52]/40 transition-opacity",
            "opacity-0 group-hover/cell:opacity-100 hover:border-[#1A3A52]/40 hover:text-[#1A3A52]/70"
          )}
        >
          <Plus className="h-3 w-3" />
          Add
        </button>
      )}
    </div>
  );
}
