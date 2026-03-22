"use client";

import { Clock, LogIn, LogOut, CheckCircle2, AlertCircle, Timer } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PermissionGuard } from "@/components/permission-guard";
import { Permissions } from "@/types/const";
import { useCheckInMutation, useCheckOutMutation } from "../hooks/use-shift-queries";
import { ShiftStatusBadge } from "./shift-status-badge";
import type { ShiftAssignmentDto } from "../types/shift-management.types";
import { useState, useEffect } from "react";

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
  const t = useTranslations("shift.myShift.checkInCard");
  const checkIn = useCheckInMutation();
  const checkOut = useCheckOutMutation();

  const att = assignment.attendance;
  const statusCode = att?.attendanceStatusCode ?? "SCHEDULED";
  const hasCheckedIn = !!att?.actualCheckInAt;
  const hasCheckedOut = !!att?.actualCheckOutAt;
  const isCompleted = statusCode === "COMPLETED";
  const isLate = statusCode === "LATE" || (att?.lateMinutes ?? 0) > 0;

  // Geofencing / Network simulation state
  const [isVerifyingLocation, setIsVerifyingLocation] = useState(false);
  const [locationVerified, setLocationVerified] = useState(false);

  useEffect(() => {
    // Only run simulation when the shift is active and not yet checked in
    if (assignment.isActive && !hasCheckedIn && !isCompleted) {
      setIsVerifyingLocation(true);
      const timer = setTimeout(() => {
        setLocationVerified(true);
        setIsVerifyingLocation(false);
      }, 1500); // Simulate network ping / GPS check latency
      return () => clearTimeout(timer);
    }
  }, [assignment.isActive, hasCheckedIn, isCompleted]);

  const handleCheckIn = () => checkIn.mutate(assignment.shiftAssignmentId);
  const handleCheckOut = () => checkOut.mutate(assignment.shiftAssignmentId);

  return (
    <Card className="overflow-hidden border border-[#D5BA98]/60 bg-white shadow-sm">
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
            <CardTitle className="text-lg text-[#1A3A52]">
              {assignment.templateName ?? t("todayShiftFallback")}
            </CardTitle>
            <CardDescription className="text-[#1A3A52]/70">
              {assignment.workDate ?? "—"}
            </CardDescription>
          </div>
          <ShiftStatusBadge statusCode={statusCode} type="attendance" />
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Planned time row */}
        <div className="flex items-center gap-3 rounded-lg border border-[#D5BA98]/45 bg-[#FDFBF9] px-3 py-2 text-sm text-[#1A3A52]/70">
          <Clock className="w-4 h-4 shrink-0" />
          <span>
            {t("scheduled")} {" "}
            <span className="font-medium text-[#1A3A52]">
              {fmt(assignment.plannedStartAt)} – {fmt(assignment.plannedEndAt)}
            </span>
          </span>
        </div>

        {/* Attendance timestamps */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-0.5 rounded-lg border border border-[#D5BA98]/60 bg-[#FDFBF9] p-3">
            <p className="text-xs uppercase tracking-wide text-[#1A3A52]/60">{t("checkIn")}</p>
            <p className="text-sm font-semibold text-[#1A3A52]">
              {hasCheckedIn ? fmtDatetime(att!.actualCheckInAt) : "—"}
            </p>
          </div>
          <div className="space-y-0.5 rounded-lg border border border-[#D5BA98]/60 bg-[#FDFBF9] p-3">
            <p className="text-xs uppercase tracking-wide text-[#1A3A52]/60">{t("checkOut")}</p>
            <p className="text-sm font-semibold text-[#1A3A52]">
              {hasCheckedOut ? fmtDatetime(att!.actualCheckOutAt) : "—"}
            </p>
          </div>
        </div>

        {/* Late / early-leave callout */}
        {isLate && att && att.lateMinutes > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-600 bg-amber-600 px-3 py-2 text-sm text-white">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {t("arrivedLate", { minutes: att.lateMinutes })}
          </div>
        )}

        {att && att.earlyLeaveMinutes > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-600 bg-amber-600 px-3 py-2 text-sm text-white">
            <Timer className="w-4 h-4 shrink-0" />
            {t("leftEarly", { minutes: att.earlyLeaveMinutes })}
          </div>
        )}

        {/* Completed state */}
        {isCompleted && att && att.workedMinutes > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-600 bg-emerald-600 px-3 py-2 text-sm text-white">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {t("workedDuration", {
              hours: Math.floor(att.workedMinutes / 60),
              minutes: att.workedMinutes % 60,
            })}
          </div>
        )}

        {/* Action buttons — only shown when assignment is active and not fully completed */}
        {assignment.isActive && !isCompleted && (
          <div className="space-y-3 pt-1">
            {!hasCheckedIn && (
              <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                isVerifyingLocation
                  ? "border-blue-200 bg-blue-50 text-blue-700 animate-pulse"
                  : locationVerified
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border border-[#D5BA98]/60 bg-[#FDFBF9] text-[#1A3A52]/60"
              }`}>
                {isVerifyingLocation ? (
                  <>
                    <div className="h-3 w-3 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                    {t("verifyingNetwork")}
                  </>
                ) : locationVerified ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {t("networkConnected")}
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5" />
                    {t("locationUnverified")}
                  </>
                )}
              </div>
            )}
            
            <div className="flex gap-3">
              <PermissionGuard permission={Permissions.CheckInShift}>
                <Button
                  className={`flex-1 gap-2 ${hasCheckedIn ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-none hover:bg-slate-100' : 'bg-[#1A3A52] text-white hover:bg-[#1A3A52]/90 shadow-sm'}`}
                  onClick={handleCheckIn}
                  disabled={hasCheckedIn || checkIn.isPending || !locationVerified}
                  isLoading={checkIn.isPending}
                >
                  <LogIn className="w-4 h-4" />
                  {t("checkInAction")}
                </Button>
              </PermissionGuard>
              <PermissionGuard permission={Permissions.CheckOutShift}>
                <Button
                  variant="outline"
                  className={`flex-1 gap-2 border-slate-300 ${!hasCheckedIn || hasCheckedOut ? 'bg-slate-50 text-slate-400 cursor-not-allowed hover:bg-slate-50' : 'border-blue-600 text-blue-700 hover:bg-blue-50 bg-white shadow-sm'}`}
                  onClick={handleCheckOut}
                  disabled={!hasCheckedIn || hasCheckedOut || checkOut.isPending}
                  isLoading={checkOut.isPending}
                >
                  <LogOut className="w-4 h-4" />
                  {t("checkOutAction")}
                </Button>
              </PermissionGuard>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
