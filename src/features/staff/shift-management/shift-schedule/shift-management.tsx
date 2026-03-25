"use client";

import { useState, useMemo, useCallback } from "react";
import { CalendarDays, List, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/components/permission-guard";
import { Permissions } from "@/types/const";
import { ShiftMatrixCalendar } from "./components/shift-matrix-calendar";
import { PublishToolbar } from "../components/publish-toolbar";
import { CopyWeekDialog } from "../components/copy-week-dialog";
import { ShiftAssignmentForm } from "../components/shift-assignment-form";
import { ShiftAssignmentPanel } from "../components/shift-assignment-panel";
// _OLD: import { ShiftScheduleList } from "../components/shift-schedule-list";
import { useTeamScheduleQuery, useShiftAssignmentDetailQuery } from "../hooks/use-shift-queries";
import type { ShiftAssignmentListDto } from "../types/shift-management.types";

// ─── Week helpers (duplicated to keep this file self-contained) ──────────────

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function fmtDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

// Orchestrator for /dashboard/shifts — manager schedule view
export function ShiftManagement() {
  const t = useTranslations("shift.schedule");
  // ── Week state ──────────────────────────────────────────────
  const [monday] = useState(() => getMonday(new Date()));
  const weekStart = fmtDate(monday);
  const weekEnd = fmtDate(addDays(monday, 6));

  // Fetch data once to derive draft count for publish bar
  const { data: staffRows = [] } = useTeamScheduleQuery(
    { weekStart, weekEnd },
    true
  );

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

  // ── Form / Panel state ──────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ShiftAssignmentListDto | null>(null);
  const [panelTargetId, setPanelTargetId] = useState<number | null>(null);
  const [prefillStaffId, setPrefillStaffId] = useState<number | undefined>();
  const [prefillDate, setPrefillDate] = useState<string | undefined>();

  // Fetch detailed assignment for the panel
  const { data: panelDetail } = useShiftAssignmentDetailQuery(
    panelTargetId ?? 0,
    !!panelTargetId
  );

  const handleCardClick = useCallback((a: ShiftAssignmentListDto) => {
    setPanelTargetId(a.shiftAssignmentId);
  }, []);

  const handleAddClick = useCallback((staffId: number, date: string) => {
    setEditTarget(null);
    setPrefillStaffId(staffId);
    setPrefillDate(date);
    setFormOpen(true);
  }, []);

  const handleCreateNew = () => {
    setEditTarget(null);
    setPrefillStaffId(undefined);
    setPrefillDate(undefined);
    setFormOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* ── Header bar ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#D5BA98]/60 bg-white px-4 py-3 shadow-sm">
        <div>
          <h1 className="font-['Cormorant_Garamond'] text-xl font-semibold text-[#1A3A52]">
            {t("title")}
          </h1>
          <p className="text-xs text-[#1A3A52]/50">
            {t("managerHint")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <CopyWeekDialog defaultSource={weekStart} />
          <PermissionGuard permission={Permissions.AssignShift}>
            <Button
              size="sm"
              className="gap-1.5 bg-[#1A3A52] hover:bg-[#1A3A52]/90"
              onClick={handleCreateNew}
            >
              <Plus className="h-3.5 w-3.5" />
              {t("newAssignment")}
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* ── Publish toolbar (visible when drafts exist) ──── */}
      <PublishToolbar
        draftCount={draftCount}
        weekStart={weekStart}
        weekEnd={weekEnd}
      />

      {/* ── Matrix Calendar ────────────────────────────────── */}
      <ShiftMatrixCalendar
        onCardClick={handleCardClick}
        onAddClick={handleAddClick}
        initialMonday={monday}
      />

      {/* ── Dialogs / Panels ───────────────────────────────── */}
      <ShiftAssignmentForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editTarget={editTarget}
      />

      {panelDetail && panelTargetId && (
        <ShiftAssignmentPanel
          assignment={panelDetail}
          open={!!panelTargetId}
          onClose={() => setPanelTargetId(null)}
        />
      )}
    </div>
  );
}
