"use client";

import { useState, useMemo } from "react";
import { Plus, RefreshCcw, Users, Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
          />
          <span className="text-muted-foreground text-sm">–</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
          />
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCcw className="w-4 h-4" />
          </Button>
        </div>
        <PermissionGuard permission={Permissions.ScheduleShift}>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Schedule
          </Button>
        </PermissionGuard>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
          Loading schedules…
        </div>
      ) : schedules.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
          No shift schedules found. Adjust the date range or create a new schedule.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Shift Type</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Time Range</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Assigned</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {schedules.map((s) => (
                <tr key={s.shiftScheduleId} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{s.businessDate}</td>
                  <td className="px-4 py-3">{s.shiftTypeName}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatTime(s.plannedStartAt)} – {formatTime(s.plannedEndAt)}
                  </td>
                  <td className="px-4 py-3">
                    <ShiftStatusBadge statusCode={s.statusCode} type="schedule" />
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Users className="w-3.5 h-3.5" />
                      {s.assignmentCount}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View Assignments — always available */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewAssignments(s)}
                        title="View assignments"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      {/* Edit — only for DRAFT */}
                      {s.statusCode === "DRAFT" && (
                        <PermissionGuard permission={Permissions.ScheduleShift}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(s)}
                            title="Edit schedule"
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
