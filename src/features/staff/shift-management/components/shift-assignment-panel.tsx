"use client";

import { useState } from "react";
import { X } from "lucide-react";
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/components/permission-guard";
import { Permissions } from "@/types/const";
import {
  useCancelAssignmentMutation,
  useCheckInMutation,
  useCheckOutMutation,
} from "../hooks/use-shift-queries";
import { ShiftStatusBadge } from "./shift-status-badge";
import { AttendanceAdjustmentDialog } from "./attendance-adjustment-dialog";
import type { ShiftAssignmentDetailDto, AttendanceRecordDto } from "../types/shift-management.types";
import { ATTENDANCE_STATUS_CONFIG } from "../types/shift-management.types";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Pass a detail DTO (with attendance) when opening the panel. */
  assignment: ShiftAssignmentDetailDto;
}

export function ShiftAssignmentPanel({ open, onClose, assignment }: Props) {
  const [adjustTarget, setAdjustTarget] = useState<AttendanceRecordDto | null>(null);

  const cancelAssignment = useCancelAssignmentMutation();
  const checkIn = useCheckInMutation();
  const checkOut = useCheckOutMutation();

  const ar = assignment.attendance;

  function formatTime(iso: string) {
    try { return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
    catch { return iso; }
  }

  const attendanceStatusCfg = ar
    ? (ATTENDANCE_STATUS_CONFIG[ar.attendanceStatusCode] ?? { label: ar.attendanceStatusCode, variant: "secondary" as const })
    : null;

  return (
    <>
      <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
        <DrawerContent className="flex flex-col sm:max-w-xl">
          <DrawerHeader className="border-b border-slate-200 bg-[#FDFBF9] pb-4">
            <div className="flex items-start justify-between">
              <div>
                <DrawerTitle className="text-[#1A3A52]">Shift Detail</DrawerTitle>
                <DrawerDescription className="mt-1 text-[#1A3A52]/70">
                  {assignment.workDate} · {assignment.templateName} ·{" "}
                  {formatTime(assignment.plannedStartAt)} – {formatTime(assignment.plannedEndAt)}
                </DrawerDescription>
              </div>
              <div className="flex items-center gap-2">
                <ShiftStatusBadge
                  statusCode={assignment.isActive ? "active" : "cancelled"}
                  type="assignment"
                />
                <button
                  onClick={onClose}
                  className="text-[#1A3A52]/60 transition-colors hover:text-[#1A3A52]"
                  aria-label="Close panel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </DrawerHeader>

          <div className="flex-1 space-y-4 overflow-y-auto bg-white p-4">
            {/* Staff info */}
            <div className="space-y-1 rounded-lg border border-slate-200 bg-[#FDFBF9] px-4 py-3">
              <p className="text-sm font-medium text-[#1A3A52]">{assignment.staffName}</p>
              <p className="text-xs text-[#1A3A52]/70">
                Assigned by {assignment.assignedByName} on {new Date(assignment.assignedAt).toLocaleDateString()}
              </p>
              {assignment.notes && (
                <p className="text-xs italic text-[#1A3A52]/65">"{assignment.notes}"</p>
              )}
            </div>

            {/* Attendance record */}
            {ar ? (
              <div className="space-y-2 rounded-lg border border-slate-200 bg-[#FDFBF9] px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[#1A3A52]">Attendance</p>
                  {attendanceStatusCfg && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                      attendanceStatusCfg.variant === "destructive"
                        ? "border-red-600 bg-red-600 text-white"
                        : attendanceStatusCfg.variant === "default"
                        ? "border-blue-600 bg-blue-600 text-white"
                        : attendanceStatusCfg.variant === "outline"
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-slate-700 bg-slate-700 text-white"
                    }`}>
                      {attendanceStatusCfg.label}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-[#1A3A52]/70">
                  <div>
                    <p className="font-medium text-[#1A3A52]">Check-in</p>
                    <p>{ar.actualCheckInAt ? formatTime(ar.actualCheckInAt) : "—"}</p>
                    {ar.lateMinutes > 0 && (
                      <p className="text-amber-700">{ar.lateMinutes}m late</p>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-[#1A3A52]">Check-out</p>
                    <p>{ar.actualCheckOutAt ? formatTime(ar.actualCheckOutAt) : "—"}</p>
                    {ar.earlyLeaveMinutes > 0 && (
                      <p className="text-amber-700">{ar.earlyLeaveMinutes}m early</p>
                    )}
                  </div>
                  {ar.workedMinutes > 0 && (
                    <div>
                      <p className="font-medium text-[#1A3A52]">Worked</p>
                      <p>{Math.floor(ar.workedMinutes / 60)}h {ar.workedMinutes % 60}m</p>
                    </div>
                  )}
                  {ar.isManualAdjustment && ar.reviewedByName && (
                    <div>
                      <p className="font-medium text-[#1A3A52]">Adjusted by</p>
                      <p>{ar.reviewedByName}</p>
                    </div>
                  )}
                </div>
                {ar.adjustmentReason && (
                  <p className="text-xs italic text-[#1A3A52]/65">
                    Reason: "{ar.adjustmentReason}"
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 bg-[#FDFBF9] px-4 py-6 text-center text-sm text-[#1A3A52]/70">
                No attendance recorded yet.
              </div>
            )}
          </div>

          {/* Action footer */}
          <div className="space-y-2 border-t border-slate-200 bg-[#FDFBF9] p-4">
            {/* Check-in / check-out buttons */}
            {assignment.isActive && (
              <div className="flex gap-2">
                {!ar?.actualCheckInAt && (
                  <PermissionGuard permission={Permissions.CheckInShift}>
                    <Button
                      className="flex-1 bg-[#1A3A52] text-white hover:bg-[#1A3A52]/90"
                      onClick={() => checkIn.mutate(assignment.shiftAssignmentId)}
                      isLoading={checkIn.isPending}
                    >
                      Check In
                    </Button>
                  </PermissionGuard>
                )}
                {ar?.actualCheckInAt && !ar.actualCheckOutAt && (
                  <PermissionGuard permission={Permissions.CheckOutShift}>
                    <Button
                      className="flex-1 border-blue-600 text-blue-700 hover:bg-blue-50"
                      onClick={() => checkOut.mutate(assignment.shiftAssignmentId)}
                      isLoading={checkOut.isPending}
                    >
                      Check Out
                    </Button>
                  </PermissionGuard>
                )}
              </div>
            )}

            {/* Manager tools */}
            <div className="flex gap-2">
              {ar && (
                <PermissionGuard permission={Permissions.AdjustAttendance}>
                  <Button variant="outline" size="sm" className="flex-1 border-slate-300 bg-white text-[#1A3A52] hover:bg-slate-100" onClick={() => setAdjustTarget(ar)}>
                    Adjust Attendance
                  </Button>
                </PermissionGuard>
              )}
              {assignment.isActive && !ar?.actualCheckInAt && (
                <PermissionGuard permission={Permissions.AssignShift}>
                  <Button
                    variant="outline" size="sm"
                    className="flex-1 border-destructive/40 text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      if (!confirm("Cancel this assignment?")) return;
                      cancelAssignment.mutate(assignment.shiftAssignmentId, { onSuccess: onClose });
                    }}
                    disabled={cancelAssignment.isPending}
                  >
                    Cancel Assignment
                  </Button>
                </PermissionGuard>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {adjustTarget && (
        <AttendanceAdjustmentDialog
          open={!!adjustTarget}
          onClose={() => setAdjustTarget(null)}
          attendanceRecord={adjustTarget}
        />
      )}
    </>
  );
}
