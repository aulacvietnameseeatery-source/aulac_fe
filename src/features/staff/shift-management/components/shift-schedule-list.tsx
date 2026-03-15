"use client";

import { useState, useMemo } from "react";
import { Plus, RefreshCcw, Users, Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALDatePicker } from "@/components/ui/al-date-picker";
import { PermissionGuard } from "@/components/permission-guard";
import { Permissions } from "@/types/const";
import {
  useShiftSchedulesQuery,
  usePublishScheduleMutation,
  useCloseScheduleMutation,
} from "../hooks/use-shift-queries";
import { ShiftStatusBadge } from "./shift-status-badge";
import { ShiftScheduleForm } from "./shift-schedule-form";
import { ShiftAssignmentPanel } from "./shift-assignment-panel";
import type { ShiftScheduleListDto, GetSchedulesParams } from "../types/shift-management.types";

export function ShiftScheduleList() {
  // ── Filters ──
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // ── Modal / panel state ──
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ShiftScheduleListDto | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelSchedule, setPanelSchedule] = useState<ShiftScheduleListDto | null>(null);

  // ── Query ──
  const params = useMemo<GetSchedulesParams>(
    () => ({
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      pageSize: 50,
    }),
    [fromDate, toDate]
  );

  const { data, isLoading, refetch } = useShiftSchedulesQuery(params);
  const schedules = data?.pageData ?? [];

  // ── Mutations ──
  const publish = usePublishScheduleMutation();
  const close = useCloseScheduleMutation();

  const handleCreate = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const handleEdit = (s: ShiftScheduleListDto) => {
    setEditTarget(s);
    setFormOpen(true);
  };

  const handleViewAssignments = (s: ShiftScheduleListDto) => {
    setPanelSchedule(s);
    setPanelOpen(true);
  };

  const handlePublish = (id: number) => {
    if (!confirm("Publish this schedule? Staff will be able to see it.")) return;
    publish.mutate(id);
  };

  const handleClose = (id: number) => {
    if (!confirm("Close this shift? This cannot be undone.")) return;
    close.mutate(id);
  };

  function formatTime(iso: string) {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return iso;
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-[#D5BA98]/40 bg-linear-to-b from-[#FDFBF9] via-[#D5BA98]/10 to-[#FDFBF9] p-5 sm:p-6">
      
      <div>
        <h1 className="text-2xl font-semibold">Shift Management</h1>
        <p className="text-sm text-muted-foreground">
          Create, publish, and manage shift schedules and staff assignments.
        </p>
      </div>
      
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#D5BA98]/50 bg-[#FDFBF9] p-2">
          <ALDatePicker
            value={fromDate}
            onChange={(val) => setFromDate(val)}
            placeholder="From date"
            clearable
            inputSize="sm"
            wrapperClassName="w-38"
          />
          <span className="text-sm text-[#1A3A52]/60">–</span>
          <ALDatePicker
            value={toDate}
            onChange={(val) => setToDate(val)}
            placeholder="To date"
            clearable
            inputSize="sm"
            wrapperClassName="w-38"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="border-[#D5BA98]/70 bg-[#FDFBF9] text-[#1A3A52] hover:bg-[#D5BA98]/20"
          >
            <RefreshCcw className="w-4 h-4" />
          </Button>
        </div>
        <PermissionGuard permission={Permissions.ScheduleShift}>
          <Button onClick={handleCreate} className="gap-2 bg-[#1A3A52] text-[#FDFBF9] hover:bg-[#1A3A52]/90">
            <Plus className="w-4 h-4" />
            Create Schedule
          </Button>
        </PermissionGuard>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-sm text-[#1A3A52]/70">
          Loading schedules…
        </div>
      ) : schedules.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-sm text-[#1A3A52]/70">
          No shift schedules found. Adjust the date range or create a new schedule.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#D5BA98]/60 bg-[#FDFBF9]">
          <table className="w-full text-sm">
            <thead className="bg-[#D5BA98]/20">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-[#1A3A52]/80">Date</th>
                <th className="px-4 py-3 text-left font-medium text-[#1A3A52]/80">Shift Type</th>
                <th className="px-4 py-3 text-left font-medium text-[#1A3A52]/80">Time Range</th>
                <th className="px-4 py-3 text-left font-medium text-[#1A3A52]/80">Status</th>
                <th className="px-4 py-3 text-left font-medium text-[#1A3A52]/80">Assigned</th>
                <th className="px-4 py-3 text-right font-medium text-[#1A3A52]/80">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D5BA98]/40">
              {schedules.map((s) => (
                <tr key={s.shiftScheduleId} className="transition-colors hover:bg-[#D5BA98]/15">
                  <td className="px-4 py-3 font-medium text-[#1A3A52]">{s.businessDate}</td>
                  <td className="px-4 py-3 text-[#1A3A52]">{s.shiftTypeName}</td>
                  <td className="px-4 py-3 text-[#1A3A52]/70">
                    {formatTime(s.plannedStartAt)} – {formatTime(s.plannedEndAt)}
                  </td>
                  <td className="px-4 py-3">
                    <ShiftStatusBadge statusCode={s.statusCode} type="schedule" />
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-[#1A3A52]/70">
                      <Users className="w-3.5 h-3.5" />
                      {s.assignmentCount}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View Assignments — always available */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#D5BA98]/60 bg-[#FDFBF9] text-[#1A3A52] hover:bg-[#D5BA98]/20"
                        onClick={() => handleViewAssignments(s)}
                        data-tooltip-content="View assignments"
                        data-tooltip-id="my-tooltip"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      {/* Edit — only for DRAFT */}
                      {s.statusCode === "DRAFT" && (
                        <PermissionGuard permission={Permissions.ScheduleShift}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[#D5BA98]/60 bg-[#FDFBF9] text-[#1A3A52] hover:bg-[#D5BA98]/20"
                            onClick={() => handleEdit(s)}
                            data-tooltip-content="Edit schedule"
                            data-tooltip-id="my-tooltip"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </PermissionGuard>
                      )}

                      {/* Publish — only for DRAFT */}
                      {s.statusCode === "DRAFT" && (
                        <PermissionGuard permission={Permissions.ScheduleShift}>
                          <Button
                            size="sm"
                            className="bg-[#1A3A52] text-[#FDFBF9] hover:bg-[#1A3A52]/90"
                            onClick={() => handlePublish(s.shiftScheduleId)}
                            isLoading={publish.isPending}
                          >
                            Publish
                          </Button>
                        </PermissionGuard>
                      )}

                      {/* Close — only for PUBLISHED */}
                      {s.statusCode === "PUBLISHED" && (
                        <PermissionGuard permission={Permissions.CloseShift}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[#D5BA98]/70 bg-[#FDFBF9] text-[#1A3A52] hover:bg-[#D5BA98]/20"
                            onClick={() => handleClose(s.shiftScheduleId)}
                            isLoading={close.isPending}
                          >
                            Close
                          </Button>
                        </PermissionGuard>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <ShiftScheduleForm open={formOpen} onClose={() => setFormOpen(false)} editTarget={editTarget} />

      {/* Assignment Panel */}
      {panelSchedule && (
        <ShiftAssignmentPanel
          open={panelOpen}
          onClose={() => {
            setPanelOpen(false);
            setPanelSchedule(null);
          }}
          schedule={panelSchedule}
        />
      )}
    </div>
  );
}
