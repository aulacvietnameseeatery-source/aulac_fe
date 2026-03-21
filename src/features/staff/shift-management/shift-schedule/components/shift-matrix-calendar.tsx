"use client";

import { useState, useMemo, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useTeamScheduleQuery,
  useReassignAssignmentMutation,
} from "../../hooks/use-shift-queries";
import type {
  ShiftAssignmentListDto,
  TeamScheduleStaffRow,
} from "../../types/shift-management.types";
import { ShiftMatrixHeader } from "./shift-matrix-header";
import { ShiftMatrixRow } from "./shift-matrix-row";
import { ShiftCard } from "../../components/shift-card";

// ─── Week helpers ────────────────────────────────────────────────────────────

/** Returns Monday 00:00 of the week containing `d`. */
function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay(); // 0=Sun, 1=Mon
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function fmtDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function fmtWeekLabel(monday: Date): string {
  const sun = addDays(monday, 6);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${monday.toLocaleDateString(undefined, opts)} – ${sun.toLocaleDateString(undefined, opts)}`;
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface ShiftMatrixCalendarProps {
  /** Callback when a card is clicked (open detail panel / edit form) */
  onCardClick?: (a: ShiftAssignmentListDto) => void;
  /** Callback when the + button in a cell is clicked */
  onAddClick?: (staffId: number, date: string) => void;
  /** Current week override (defaults to this week) */
  initialMonday?: Date;
  /** External overrides for the staff schedule data (for read-only team view) */
  externalData?: TeamScheduleStaffRow[];
  /** Whether to hide DnD (used for read-only views) */
  readOnly?: boolean;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ShiftMatrixCalendar({
  onCardClick,
  onAddClick,
  initialMonday,
  externalData,
  readOnly = false,
}: ShiftMatrixCalendarProps) {
  // ── Week navigation ─────────────────────────────────────────────
  const [monday, setMonday] = useState(() => initialMonday ?? getMonday(new Date()));

  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  }, [monday]);

  const weekParams = useMemo(
    () => ({
      weekStart: fmtDate(monday),
      weekEnd: fmtDate(addDays(monday, 6)),
    }),
    [monday]
  );

  const goToday = useCallback(() => setMonday(getMonday(new Date())), []);
  const goPrev = useCallback(() => setMonday((m) => addDays(m, -7)), []);
  const goNext = useCallback(() => setMonday((m) => addDays(m, 7)), []);

  // ── Data fetching ───────────────────────────────────────────────
  const {
    data: fetchedRows,
    isLoading,
    isFetching,
  } = useTeamScheduleQuery(weekParams, !externalData);

  const staffRows: TeamScheduleStaffRow[] = externalData ?? fetchedRows ?? [];

  // ── DnD ─────────────────────────────────────────────────────────
  const reassign = useReassignAssignmentMutation();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const [dragging, setDragging] = useState<ShiftAssignmentListDto | null>(null);

  const handleDragStart = useCallback((e: DragStartEvent) => {
    const a = e.active.data?.current?.assignment as ShiftAssignmentListDto | undefined;
    if (a) setDragging(a);
  }, []);

  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      setDragging(null);
      const { active, over } = e;
      if (!over || readOnly) return;

      const assignment = active.data?.current?.assignment as ShiftAssignmentListDto | undefined;
      if (!assignment) return;

      // droppable id format: "staffId-yyyy-MM-dd"
      const overId = String(over.id);
      const dashIdx = overId.indexOf("-");
      if (dashIdx === -1) return;
      const targetStaffId = parseInt(overId.slice(0, dashIdx), 10);
      if (isNaN(targetStaffId)) return;

      // Only reassign if dropped on a different staff
      if (targetStaffId === assignment.staffId) return;

      reassign.mutate({
        id: assignment.shiftAssignmentId,
        body: { newStaffId: targetStaffId },
      });
    },
    [readOnly, reassign]
  );

  // ── Draft count for publish indicator ───────────────────────────
  const draftCount = useMemo(
    () =>
      staffRows.reduce(
        (sum, row) =>
          sum +
          row.assignments.filter(
            (a) => a.assignmentStatusCode?.toUpperCase() === "DRAFT"
          ).length,
        0
      ),
    [staffRows]
  );

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-0 rounded-xl border border-[#D5BA98]/60 bg-white shadow-sm overflow-hidden">
      {/* ─── Toolbar ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-[#D5BA98]/30 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToday}
            className="h-7 gap-1 text-xs"
          >
            <CalendarDays className="h-3.5 w-3.5" />
            Today
          </Button>

          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goPrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <span className="text-sm font-semibold text-[#1A3A52]">
            {fmtWeekLabel(monday)}
          </span>

          {isFetching && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#1A3A52]/40" />
          )}
        </div>

        {/* Draft indicator */}
        {!readOnly && draftCount > 0 && (
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
            {draftCount} draft{draftCount > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ─── Matrix ───────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-[#1A3A52]/40">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading schedule…
        </div>
      ) : staffRows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#1A3A52]/40 text-sm">
          <CalendarDays className="mb-2 h-8 w-8" />
          No schedule data for this week
        </div>
      ) : (
        <DndContext
          sensors={readOnly ? [] : sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              <ShiftMatrixHeader weekDates={weekDates} />

              {staffRows.map((staff, idx) => (
                <ShiftMatrixRow
                  key={staff.staffId}
                  staff={staff}
                  weekDates={weekDates}
                  isEven={idx % 2 === 0}
                  onCardClick={onCardClick}
                  onAddClick={readOnly ? undefined : onAddClick}
                />
              ))}
            </div>
          </div>

          {/* Drag overlay — floating card that follows the cursor */}
          <DragOverlay>
            {dragging ? (
              <div className="w-[140px]">
                <ShiftCard assignment={dragging} draggable={false} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
