"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { dateUtils } from "@/lib/date-utils";
import type { ShiftAssignmentListDto } from "../types/shift-management.types";

// ─── Status → visual config ─────────────────────────────────────────────────

const STATUS_STYLE: Record<
  string,
  { dot: string; border: string; bg: string; text: string }
> = {
  DRAFT: {
    dot: "bg-amber-400",
    border: "border-dashed border-amber-400",
    bg: "bg-amber-50",
    text: "text-amber-800",
  },
  ASSIGNED: {
    dot: "bg-blue-500",
    border: "border-solid border-blue-400",
    bg: "bg-blue-50",
    text: "text-blue-800",
  },
  CONFIRMED: {
    dot: "bg-emerald-500",
    border: "border-solid border-emerald-400",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
  },
  CANCELLED: {
    dot: "bg-red-500",
    border: "border-solid border-red-300",
    bg: "bg-red-50/60",
    text: "text-red-700 line-through opacity-60",
  },
};

function getStyle(code: string) {
  return STATUS_STYLE[code?.toUpperCase()] ?? STATUS_STYLE.ASSIGNED;
}

function fmtTime(iso: string) {
  try {
    return dateUtils.formatLocal(iso, "HH:mm");
  } catch {
    return iso?.slice(11, 16) ?? "--:--";
  }
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface ShiftCardProps {
  assignment: ShiftAssignmentListDto;
  /** Whether this card is inside a DnD context */
  draggable?: boolean;
  /** Whether there is a conflict for this assignment */
  hasConflict?: boolean;
  onClick?: (assignment: ShiftAssignmentListDto) => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ShiftCard({
  assignment,
  draggable = true,
  hasConflict = false,
  onClick,
}: ShiftCardProps) {
  const t = useTranslations("shift.schedule.matrix");
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `assignment-${assignment.shiftAssignmentId}`,
    disabled: !draggable,
    data: { type: "shift-card", assignment },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const s = getStyle(assignment.assignmentStatusCode);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex items-start gap-1.5 rounded-lg border px-2 py-1.5 text-xs cursor-pointer transition-shadow",
        s.border,
        s.bg,
        isDragging && "z-50 shadow-lg opacity-80 ring-2 ring-[#1A3A52]/30",
        !isDragging && "hover:shadow-sm"
      )}
      onClick={() => onClick?.(assignment)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") onClick?.(assignment); }}
    >
      {/* Drag handle */}
      {draggable && (
        <span
          {...attributes}
          {...listeners}
          className="mt-0.5 flex shrink-0 cursor-grab items-center text-[#1A3A52]/30 hover:text-[#1A3A52]/60 active:cursor-grabbing"
          aria-label={t("dragToReassign")}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </span>
      )}

      <div className="flex-1 min-w-0">
        {/* Row 1: dot + template name */}
        <div className="flex items-center gap-1">
          <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", s.dot)} />
          <span className={cn("truncate font-medium leading-tight", s.text)}>
            {assignment.templateName}
          </span>
          {hasConflict && (
            <AlertCircle className="h-3 w-3 shrink-0 text-red-600" />
          )}
        </div>

        {/* Row 2: time range */}
        <p className="mt-0.5 text-[10px] leading-none text-[#1A3A52]/55">
          {fmtTime(assignment.plannedStartAt)} – {fmtTime(assignment.plannedEndAt)}
        </p>

        {/* Row 3: tags if present */}
        {assignment.tags && (
          <span className="mt-0.5 inline-block rounded bg-[#D5BA98]/25 px-1 py-px text-[9px] font-medium text-[#1A3A52]/60">
            {assignment.tags}
          </span>
        )}
      </div>
    </div>
  );
}
