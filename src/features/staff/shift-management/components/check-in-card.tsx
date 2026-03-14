"use client";

import { Clock, LogIn, LogOut, CheckCircle2, AlertCircle, Timer } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PermissionGuard } from "@/components/permission-guard";
import { Permissions } from "@/types/const";
import { useCheckInMutation, useCheckOutMutation } from "../hooks/use-shift-queries";
import { ShiftStatusBadge } from "./shift-status-badge";
import type { ShiftAssignmentDto } from "../types/shift-management.types";

interface Props {
  assignment: ShiftAssignmentDto;
}

function fmt(iso: string | null | undefined, fallback = "—") {
  if (!iso) return fallback;
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return fallback;
  }
}

function fmtDatetime(iso: string | null | undefined, fallback = "—") {
  if (!iso) return fallback;
  try {
    return new Date(iso).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return fallback;
  }
}

export function CheckInCard({ assignment }: Props) {
  const checkIn = useCheckInMutation();
  const checkOut = useCheckOutMutation();

  const att = assignment.attendance;
  const statusCode = att?.attendanceStatusCode ?? "SCHEDULED";
  const hasCheckedIn = !!att?.actualCheckInAt;
  const hasCheckedOut = !!att?.actualCheckOutAt;
  const isCompleted = statusCode === "COMPLETED";
  const isLate = statusCode === "LATE" || (att?.lateMinutes ?? 0) > 0;

  const handleCheckIn = () => checkIn.mutate(assignment.shiftAssignmentId);
  const handleCheckOut = () => checkOut.mutate(assignment.shiftAssignmentId);

  return (
    <Card className="overflow-hidden border-border">
      {/* Accent top bar */}
      <div
        className={`h-1 w-full ${
          isCompleted
            ? "bg-green-500"
            : statusCode === "ACTIVE"
              ? "bg-primary"
              : isLate
                ? "bg-destructive"
                : statusCode === "ABSENT"
                  ? "bg-destructive"
                  : "bg-muted"
        }`}
      />

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {assignment.shiftTypeName ?? "Today's Shift"}
            </CardTitle>
            <CardDescription>
              {assignment.businessDate ?? "—"}
            </CardDescription>
          </div>
          <ShiftStatusBadge statusCode={statusCode} type="attendance" />
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Planned time row */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Clock className="w-4 h-4 shrink-0" />
          <span>
            Scheduled{" "}
            <span className="font-medium text-foreground">
              {fmt(assignment.plannedStartAt)} – {fmt(assignment.plannedEndAt)}
            </span>
          </span>
        </div>

        {/* Attendance timestamps */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-0.5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Check-in</p>
            <p className="text-sm font-semibold">
              {hasCheckedIn ? fmtDatetime(att!.actualCheckInAt) : "—"}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-0.5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Check-out</p>
            <p className="text-sm font-semibold">
              {hasCheckedOut ? fmtDatetime(att!.actualCheckOutAt) : "—"}
            </p>
          </div>
        </div>

        {/* Late / early-leave callout */}
        {isLate && att && att.lateMinutes > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Arrived {att.lateMinutes} min late
          </div>
        )}

        {att && att.earlyLeaveMinutes > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
            <Timer className="w-4 h-4 shrink-0" />
            Left {att.earlyLeaveMinutes} min early
          </div>
        )}

        {/* Completed state */}
        {isCompleted && att && att.workedMinutes > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Worked {Math.floor(att.workedMinutes / 60)}h {att.workedMinutes % 60}m
          </div>
        )}

        {/* Action buttons — only shown when assignment is not cancelled */}
        {assignment.assignmentStatusCode !== "CANCELLED" && !isCompleted && (
          <div className="flex gap-3 pt-1">
            <PermissionGuard permission={Permissions.CheckInShift}>
              <Button
                className="flex-1 gap-2"
                onClick={handleCheckIn}
                disabled={hasCheckedIn || checkIn.isPending}
                isLoading={checkIn.isPending}
              >
                <LogIn className="w-4 h-4" />
                Check In
              </Button>
            </PermissionGuard>
            <PermissionGuard permission={Permissions.CheckOutShift}>
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={handleCheckOut}
                disabled={!hasCheckedIn || hasCheckedOut || checkOut.isPending}
                isLoading={checkOut.isPending}
              >
                <LogOut className="w-4 h-4" />
                Check Out
              </Button>
            </PermissionGuard>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
