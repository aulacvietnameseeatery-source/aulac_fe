"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragMoveEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Loader2,
  MousePointerSquareDashed,
  Check,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ALCombobox } from "@/components/ui/al-combobox";
import type { ALComboboxOption } from "@/components/ui/al-combobox";
import { ALDatePicker } from "@/components/ui/al-date-picker";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  useTeamScheduleQuery,
  useReassignAssignmentMutation,
  useStaffListQuery,
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

/** Parse a "YYYY-MM-DD" string as local midnight (no TZ shift). */
function parseIsoDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
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
  /** Callback when user confirms a multi-cell selection for bulk assignment */
  onBulkSelect?: (staffIds: number[], workDates: string[]) => void;
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
  onBulkSelect,
  initialMonday,
  externalData,
  readOnly = false,
}: ShiftMatrixCalendarProps) {
  const t = useTranslations("shift.schedule.matrix");
  // ── Date range navigation ───────────────────────────────────
  const [monday, setMonday] = useState(() => initialMonday ?? getMonday(new Date()));
  const [rangeStart, setRangeStart] = useState(() => fmtDate(initialMonday ?? getMonday(new Date())));
  const [rangeEnd, setRangeEnd] = useState(() => fmtDate(addDays(initialMonday ?? getMonday(new Date()), 6)));

  /** All dates between rangeStart..rangeEnd inclusive */
  const rangeDates = useMemo(() => {
    const start = parseIsoDate(rangeStart);
    const end = parseIsoDate(rangeEnd);
    const dates: Date[] = [];
    for (let cur = new Date(start); cur <= end; cur = addDays(cur, 1)) {
      dates.push(new Date(cur));
    }
    return dates;
  }, [rangeStart, rangeEnd]);

  // Keep monday in sync for month-query when using week nav buttons
  const weekParams = useMemo(
    () => ({
      weekStart: rangeStart,
      weekEnd: rangeEnd,
    }),
    [rangeStart, rangeEnd]
  );

  const goToday = useCallback(() => {
    const m = getMonday(new Date());
    setMonday(m);
    setRangeStart(fmtDate(m));
    setRangeEnd(fmtDate(addDays(m, 6)));
  }, []);
  const goPrev = useCallback(() => {
    setMonday((m) => {
      const prev = addDays(m, -7);
      setRangeStart(fmtDate(prev));
      setRangeEnd(fmtDate(addDays(prev, 6)));
      return prev;
    });
  }, []);
  const goNext = useCallback(() => {
    setMonday((m) => {
      const next = addDays(m, 7);
      setRangeStart(fmtDate(next));
      setRangeEnd(fmtDate(addDays(next, 6)));
      return next;
    });
  }, []);

  const handleRangeStartChange = useCallback((v: string) => {
    setRangeStart(v);
    setMonday(getMonday(parseIsoDate(v)));
  }, []);

  const handleRangeEndChange = useCallback((v: string) => {
    setRangeEnd(v);
  }, []);

  // ── Data fetching ───────────────────────────────────────────────
  const {
    data: rangeData,
    isLoading,
    isFetching,
  } = useTeamScheduleQuery(weekParams, !externalData);

  const allStaffRows = useMemo<TeamScheduleStaffRow[]>(
    () => externalData ?? rangeData ?? [],
    [externalData, rangeData]
  );

  // ── Staff filter ────────────────────────────────────────────────
  const { data: staffList = [] } = useStaffListQuery();
  const [selectedStaffIds, setSelectedStaffIds] = useState<(string | number)[]>([]);
  const [showNoShiftEmployees, setShowNoShiftEmployees] = useState(true);
  const didInitAllSelectedRef = useRef(false);

  useEffect(() => {
    if (didInitAllSelectedRef.current) return;
    if (staffList.length === 0) return;
    setSelectedStaffIds(staffList.map((s) => s.accountId));
    didInitAllSelectedRef.current = true;
  }, [staffList]);

  const staffOptions = useMemo<ALComboboxOption[]>(
    () => staffList.map((s) => ({ value: s.accountId, label: s.fullName, description: s.roleName })),
    [staffList]
  );

  const staffRows = useMemo(() => {
    const selectedIds = new Set(selectedStaffIds.map(Number));
    const assignmentMap = new Map(allStaffRows.map((r) => [r.staffId, r]));

    const selectedBaseRows = (staffList.length > 0 ? staffList : allStaffRows).filter((s) =>
      selectedIds.has("accountId" in s ? s.accountId : s.staffId)
    );

    const mergedRows: TeamScheduleStaffRow[] = selectedBaseRows.map((s) => {
      const staffId = "accountId" in s ? s.accountId : s.staffId;
      const assigned = assignmentMap.get(staffId);
      return {
        staffId,
        staffName: "fullName" in s ? s.fullName : s.staffName,
        roleName: ("roleName" in s ? s.roleName : "") || assigned?.roleName || "",
        assignments: assigned?.assignments ?? [],
      };
    });

    return showNoShiftEmployees
      ? mergedRows
      : mergedRows.filter((r) => (r.assignments?.length ?? 0) > 0);
  }, [allStaffRows, selectedStaffIds, showNoShiftEmployees, staffList]);

  // ── Cell selection mode ─────────────────────────────────────────
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const isDraggingSelectRef = useRef(false);

  const toggleSelectionMode = useCallback(() => {
    setSelectionMode((prev) => {
      if (prev) setSelectedCells(new Set());
      return !prev;
    });
  }, []);

  const handleCellMouseDown = useCallback(
    (staffId: number, date: string) => {
      if (!selectionMode) return;
      isDraggingSelectRef.current = true;
      const cellId = `${staffId}-${date}`;
      setSelectedCells((prev) => {
        const next = new Set(prev);
        if (next.has(cellId)) next.delete(cellId);
        else next.add(cellId);
        return next;
      });
    },
    [selectionMode]
  );

  const handleCellMouseEnter = useCallback(
    (staffId: number, date: string) => {
      if (!selectionMode || !isDraggingSelectRef.current) return;
      const cellId = `${staffId}-${date}`;
      setSelectedCells((prev) => {
        if (prev.has(cellId)) return prev;
        const next = new Set(prev);
        next.add(cellId);
        return next;
      });
    },
    [selectionMode]
  );

  // Stop drag-selecting on mouseup anywhere
  useEffect(() => {
    const handleMouseUp = () => {
      isDraggingSelectRef.current = false;
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const handleCancelSelection = useCallback(() => {
    setSelectedCells(new Set());
    setSelectionMode(false);
  }, []);

  const handleConfirmSelection = useCallback(() => {
    if (!onBulkSelect || selectedCells.size === 0) return;
    const staffIdSet = new Set<number>();
    const dateSet = new Set<string>();
    for (const cellId of selectedCells) {
      const dashIdx = cellId.indexOf("-");
      staffIdSet.add(parseInt(cellId.slice(0, dashIdx), 10));
      dateSet.add(cellId.slice(dashIdx + 1));
    }
    onBulkSelect(Array.from(staffIdSet), Array.from(dateSet).sort());
    setSelectedCells(new Set());
    setSelectionMode(false);
  }, [onBulkSelect, selectedCells]);

  // ── DnD ─────────────────────────────────────────────────────────
  const reassign = useReassignAssignmentMutation();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const [dragging, setDragging] = useState<ShiftAssignmentListDto | null>(null);
  const [edgeHint, setEdgeHint] = useState<"left" | "right" | null>(null);
  const matrixScrollRef = useRef<HTMLDivElement | null>(null);
  const lastEdgeNavAtRef = useRef(0);
  const edgeNavDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const EDGE_THRESHOLD_PX = 56;
  const EDGE_NAV_COOLDOWN_MS = 450;
  const EDGE_NAV_DEBOUNCE_MS = 220;

  const handleDragStart = useCallback((e: DragStartEvent) => {
    const a = e.active.data?.current?.assignment as ShiftAssignmentListDto | undefined;
    if (a) setDragging(a);
  }, []);

  const handleDragMove = useCallback((e: DragMoveEvent) => {
    if (readOnly) return;
    const container = matrixScrollRef.current;
    if (!container) return;

    const translated = e.active.rect.current.translated;
    const activeRect = translated ?? e.active.rect.current.initial;
    if (!activeRect) return;
    const x = activeRect.left + activeRect.width / 2;

    const now = Date.now();
    if (now - lastEdgeNavAtRef.current < EDGE_NAV_COOLDOWN_MS) return;

    const rect = container.getBoundingClientRect();
    const triggerEdgeNav = (dir: "left" | "right") => {
      if (edgeNavDebounceTimerRef.current) return;
      edgeNavDebounceTimerRef.current = setTimeout(() => {
        setMonday((m) => addDays(m, dir === "right" ? 7 : -7));
        lastEdgeNavAtRef.current = Date.now();
        edgeNavDebounceTimerRef.current = null;
      }, EDGE_NAV_DEBOUNCE_MS);
    };

    if (x >= rect.right - EDGE_THRESHOLD_PX) {
      setEdgeHint("right");
      triggerEdgeNav("right");
      return;
    }

    if (x <= rect.left + EDGE_THRESHOLD_PX) {
      setEdgeHint("left");
      triggerEdgeNav("left");
      return;
    }

    setEdgeHint(null);
    if (edgeNavDebounceTimerRef.current) {
      clearTimeout(edgeNavDebounceTimerRef.current);
      edgeNavDebounceTimerRef.current = null;
    }
  }, [readOnly]);

  const handleDragCancel = useCallback(() => {
    setDragging(null);
    setEdgeHint(null);
    if (edgeNavDebounceTimerRef.current) {
      clearTimeout(edgeNavDebounceTimerRef.current);
      edgeNavDebounceTimerRef.current = null;
    }
  }, []);

  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      setDragging(null);
      setEdgeHint(null);
      if (edgeNavDebounceTimerRef.current) {
        clearTimeout(edgeNavDebounceTimerRef.current);
        edgeNavDebounceTimerRef.current = null;
      }
      const { active, over } = e;
      if (!over || readOnly) return;

      const assignment = active.data?.current?.assignment as ShiftAssignmentListDto | undefined;
      if (!assignment) return;

      // droppable id format: "staffId-yyyy-MM-dd"
      const overId = String(over.id);
      const dashIdx = overId.indexOf("-");
      if (dashIdx === -1) return;
      const targetStaffId = parseInt(overId.slice(0, dashIdx), 10);
      const targetDate = overId.slice(dashIdx + 1);
      if (isNaN(targetStaffId)) return;

      // No-op when staff/date are unchanged
      if (targetStaffId === assignment.staffId && targetDate === assignment.workDate.slice(0, 10)) {
        return;
      }

      reassign.mutate({
        id: assignment.shiftAssignmentId,
        body: { newStaffId: targetStaffId, newWorkDate: targetDate },
      }, {
        onSuccess: () => {
          const weekEnd = fmtDate(addDays(monday, 6));
          if (targetDate === weekEnd) {
            setMonday((m) => addDays(m, 7));
          }
        },
      });
    },
    [monday, readOnly, reassign]
  );

  // ── Draft count for publish indicator ───────────────────────────
  const draftCount = useMemo(
    () =>
      staffRows.reduce(
        (sum, row) =>
          sum +
          (row?.assignments ?? []).filter(
            (a) => a.assignmentStatusCode?.toUpperCase() === "DRAFT"
          ).length,
        0
      ),
    [staffRows]
  );

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-0 rounded-xl border border-[#D5BA98]/60 bg-white shadow-sm overflow-hidden h-full">
      {/* ─── Toolbar ──────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D5BA98]/30 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToday}
            className="h-7 gap-1 text-xs"
          >
            <CalendarDays className="h-3.5 w-3.5" />
            {t("today")}
          </Button>

          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goPrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Date range pickers */}
          <ALDatePicker
            value={rangeStart}
            onChange={handleRangeStartChange}
            inputSize="sm"
            placeholder={t("from")}
          />
          <span className="text-xs text-[#1A3A52]/50">–</span>
          <ALDatePicker
            value={rangeEnd}
            onChange={handleRangeEndChange}
            minDate={rangeStart}
            inputSize="sm"
            placeholder={t("to")}
          />

          <span className="rounded-full border border-[#D5BA98]/60 bg-[#FDFBF9] px-2 py-0.5 text-[10px] font-semibold text-[#1A3A52]/70">
            {rangeDates.length}d
          </span>

          {isFetching && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#1A3A52]/40" />
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Staff filter */}
          <ALCombobox
            options={staffOptions}
            value={selectedStaffIds}
            onChange={(val) => {
              const next = Array.isArray(val) ? val : val ? [val] : [];
              setSelectedStaffIds(next);
            }}
            multiple
            showSelectAll
            searchable
            clearable
            placeholder={t("filterStaff")}
            inputSize="sm"
            maxTags={2}
            className="min-w-50"
          />

          <div className="flex items-center gap-1 rounded-md border border-[#D5BA98]/50 px-2 py-1">
            <Switch
              checked={showNoShiftEmployees}
              onChange={setShowNoShiftEmployees}
            />
            <span className="text-[11px] text-[#1A3A52]/70">
              {t("showNoShiftEmployees")}
            </span>
          </div>

          {/* Draft indicator */}
          {!readOnly && draftCount > 0 && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
              {t("draftCount", { count: draftCount })}
            </span>
          )}

          {/* Selection mode toggle */}
          {!readOnly && onBulkSelect && (
            <Button
              variant={selectionMode ? "default" : "outline"}
              size="sm"
              onClick={toggleSelectionMode}
              className={cn("h-7 gap-1 text-xs", selectionMode && "bg-blue-600 hover:bg-blue-700 text-white")}
              title={t("selectModeHint")}
            >
              <MousePointerSquareDashed className="h-3.5 w-3.5" />
              {t("selectMode")}
            </Button>
          )}
        </div>
      </div>

      {/* ─── Selection bar (when cells are selected) ─────────── */}
      {selectionMode && selectedCells.size > 0 && (
        <div className="flex items-center justify-between gap-2 border-b border-blue-200 bg-blue-50 px-4 py-1.5">
          <span className="text-xs font-medium text-blue-700">
            {t("confirmSelection", { count: selectedCells.size })}
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelSelection}
              className="h-6 gap-1 text-xs text-blue-700 hover:text-blue-900"
            >
              <X className="h-3 w-3" />
              {t("cancelSelection")}
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmSelection}
              className="h-6 gap-1 bg-blue-600 text-xs text-white hover:bg-blue-700"
            >
              <Check className="h-3 w-3" />
              {t("confirmSelection", { count: selectedCells.size })}
            </Button>
          </div>
        </div>
      )}

      {/* ─── Matrix ───────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center py-20 text-[#1A3A52]/40">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          {t("loading")}
        </div>
      ) : staffRows.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-20 text-[#1A3A52]/40 text-sm">
          <CalendarDays className="mb-2 h-8 w-8" />
          {t("empty")}
        </div>
      ) : (
        <DndContext
          sensors={readOnly || selectionMode ? [] : sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragCancel={handleDragCancel}
          onDragEnd={handleDragEnd}
        >
          <div ref={matrixScrollRef} className="relative flex-1 h-0 overflow-auto">
            {dragging && (
              <>
                <div
                  className={`pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-10 bg-linear-to-r from-[#1A3A52]/12 to-transparent transition-opacity ${
                    edgeHint === "left" ? "opacity-100" : "opacity-30"
                  }`}
                />
                <div
                  className={`pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-10 bg-linear-to-l from-[#1A3A52]/12 to-transparent transition-opacity ${
                    edgeHint === "right" ? "opacity-100" : "opacity-30"
                  }`}
                />
              </>
            )}
            <div className="min-w-[900px]">
              <ShiftMatrixHeader weekDates={rangeDates} />

              <div className="overflow-y-auto ">
                {staffRows.map((staff, idx) => (
                  <ShiftMatrixRow
                    key={`${staff.staffId}-${idx}`}
                    staff={staff}
                    weekDates={rangeDates}
                    isEven={idx % 2 === 0}
                    selectedCells={selectionMode ? selectedCells : undefined}
                    onCardClick={onCardClick}
                    onAddClick={readOnly ? undefined : onAddClick}
                    onCellMouseDown={selectionMode ? handleCellMouseDown : undefined}
                    onCellMouseEnter={selectionMode ? handleCellMouseEnter : undefined}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Drag overlay — floating card that follows the cursor */}
          <DragOverlay>
            {dragging ? (
              <div className="w-35">
                <ShiftCard assignment={dragging} draggable={false} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
