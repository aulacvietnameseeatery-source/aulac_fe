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
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ALCombobox } from "@/components/ui/al-combobox";
import type { ALComboboxOption } from "@/components/ui/al-combobox";
import { Switch } from "@/components/ui/switch";
import {
  useTeamScheduleMonthQuery,
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
  const t = useTranslations("shift.schedule.matrix");
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
    data: monthData,
    isLoading,
    isFetching,
  } = useTeamScheduleMonthQuery(weekParams.weekStart, !externalData);

  const weekStarts = useMemo(
    () => monthData?.weekStarts ?? [weekParams.weekStart],
    [monthData?.weekStarts, weekParams.weekStart]
  );

  const currentWeekPage = useMemo(() => {
    const idx = weekStarts.indexOf(weekParams.weekStart);
    return idx >= 0 ? idx + 1 : 1;
  }, [weekParams.weekStart, weekStarts]);

  const allStaffRows = useMemo<TeamScheduleStaffRow[]>(
    () => externalData ?? monthData?.byWeek[weekParams.weekStart] ?? [],
    [externalData, monthData?.byWeek, weekParams.weekStart]
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

          <span className="text-sm font-semibold text-[#1A3A52]">
            {fmtWeekLabel(monday)}
          </span>

          <span className="rounded-full border border-[#D5BA98]/60 bg-[#FDFBF9] px-2 py-0.5 text-[10px] font-semibold text-[#1A3A52]/70">
            {t("weekPage", { current: currentWeekPage, total: weekStarts.length })}
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
        </div>
      </div>

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
          sensors={readOnly ? [] : sensors}
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
            <div className="min-w-225">
              <ShiftMatrixHeader weekDates={weekDates} />

              <div className="overflow-y-auto ">
                {staffRows.map((staff, idx) => (
                  <ShiftMatrixRow
                    key={`${staff.staffId}-${idx}`}
                    staff={staff}
                    weekDates={weekDates}
                    isEven={idx % 2 === 0}
                    onCardClick={onCardClick}
                    onAddClick={readOnly ? undefined : onAddClick}
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
