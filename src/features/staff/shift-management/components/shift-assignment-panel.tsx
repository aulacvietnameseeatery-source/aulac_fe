"use client";

import { useState, useMemo } from "react";
import { X, UserPlus, Loader2 } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PermissionGuard } from "@/components/permission-guard";
import { Permissions } from "@/types/const";
import {
  useShiftAssignmentsQuery,
  useCreateAssignmentsMutation,
  useCancelAssignmentMutation,
  useStaffForAssignmentQuery,
} from "../hooks/use-shift-queries";
import { ShiftStatusBadge } from "./shift-status-badge";
import type { ShiftScheduleListDto } from "../types/shift-management.types";

interface Props {
  open: boolean;
  onClose: () => void;
  schedule: ShiftScheduleListDto;
}

export function ShiftAssignmentPanel({ open, onClose, schedule }: Props) {
  const [selectedStaffIds, setSelectedStaffIds] = useState<number[]>([]);
  const [showAddStaff, setShowAddStaff] = useState(false);

  const { data: assignmentsPage, isLoading: assignmentsLoading } = useShiftAssignmentsQuery(
    { shiftScheduleId: schedule.shiftScheduleId, pageSize: 100 }
  );
  const assignments = assignmentsPage?.pageData ?? [];

  const { data: staffList = [], isLoading: staffLoading } = useStaffForAssignmentQuery(
    open && showAddStaff
  );

  const createAssignments = useCreateAssignmentsMutation();
  const cancelAssignment = useCancelAssignmentMutation();

  // Staff not yet actively assigned to this schedule
  const activeAssignedIds = useMemo(
    () =>
      new Set(
        assignments
          .filter((a) => a.assignmentStatusCode !== "CANCELLED")
          .map((a) => a.staffId)
      ),
    [assignments]
  );

  const availableStaff = staffList.filter((s) => !activeAssignedIds.has(s.accountId));

  const toggleStaff = (id: number) => {
    setSelectedStaffIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAssign = () => {
    if (selectedStaffIds.length === 0) return;
    createAssignments.mutate(
      { shiftScheduleId: schedule.shiftScheduleId, staffIds: selectedStaffIds },
      {
        onSuccess: () => {
          setSelectedStaffIds([]);
          setShowAddStaff(false);
        },
      }
    );
  };

  const handleCancel = (assignmentId: number) => {
    if (!confirm("Cancel this assignment?")) return;
    cancelAssignment.mutate(assignmentId);
  };

  function formatTime(iso: string) {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return iso;
    }
  }

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()}>
      <DrawerContent className="sm:max-w-xl flex flex-col">
        <DrawerHeader className="border-b pb-4">
          <div className="flex items-start justify-between">
            <div>
              <DrawerTitle>Shift Assignments</DrawerTitle>
              <DrawerDescription className="mt-1">
                {schedule.businessDate} · {schedule.shiftTypeName} ·{" "}
                {formatTime(schedule.plannedStartAt)} – {formatTime(schedule.plannedEndAt)}
              </DrawerDescription>
            </div>
            <div className="flex items-center gap-2">
              <ShiftStatusBadge statusCode={schedule.statusCode} type="schedule" />
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </DrawerHeader>

        {/* Assignments list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {assignmentsLoading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading assignments…
            </div>
          ) : assignments.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground text-sm">
              No staff assigned yet.
            </div>
          ) : (
            assignments.map((a) => (
              <div
                key={a.shiftAssignmentId}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5"
              >
                <div>
                  <p className="text-sm font-medium">{a.staffName}</p>
                  <p className="text-xs text-muted-foreground">{a.roleName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <ShiftStatusBadge statusCode={a.assignmentStatusCode} type="assignment" />
                  {a.assignmentStatusCode !== "CANCELLED" && (
                    <PermissionGuard permission={Permissions.AssignShift}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancel(a.shiftAssignmentId)}
                        disabled={cancelAssignment.isPending}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 px-2 text-xs"
                      >
                        Cancel
                      </Button>
                    </PermissionGuard>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Staff section */}
        <div className="border-t p-4 space-y-3">
          <PermissionGuard permission={Permissions.AssignShift}>
            {!showAddStaff ? (
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => setShowAddStaff(true)}
                disabled={schedule.statusCode === "CLOSED" || schedule.statusCode === "CANCELLED"}
              >
                <UserPlus className="w-4 h-4" />
                Add Staff
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Select staff to assign:</p>
                {staffLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading staff…
                  </div>
                ) : availableStaff.length === 0 ? (
                  <p className="text-sm text-muted-foreground">All staff are already assigned.</p>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1 border border-border rounded-lg p-2">
                    {availableStaff.map((s) => (
                      <label
                        key={s.accountId}
                        className="flex items-center gap-3 rounded px-2 py-1.5 cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStaffIds.includes(s.accountId)}
                          onChange={() => toggleStaff(s.accountId)}
                          className="w-4 h-4 accent-primary"
                        />
                        <span className="text-sm flex-1">{s.fullName}</span>
                        <span className="text-xs text-muted-foreground">{s.roleName}</span>
                      </label>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setShowAddStaff(false);
                      setSelectedStaffIds([]);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={handleAssign}
                    disabled={selectedStaffIds.length === 0 || createAssignments.isPending}
                    isLoading={createAssignments.isPending}
                  >
                    Assign{selectedStaffIds.length > 0 ? ` (${selectedStaffIds.length})` : ""}
                  </Button>
                </div>
              </div>
            )}
          </PermissionGuard>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
