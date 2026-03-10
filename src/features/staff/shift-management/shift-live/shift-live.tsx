"use client";

import { useMemo, useState } from "react";
import { Radio, RefreshCcw, Users, Zap, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALDatePicker } from "@/components/ui/al-date-picker";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { PermissionGuard } from "@/components/permission-guard";
import { Permissions } from "@/types/const";
import { useLiveDutyBoardQuery } from "../hooks/use-shift-queries";
import { ShiftStatusBadge } from "../components/shift-status-badge";
import { AttendanceAdjustmentDialog } from "../components/attendance-adjustment-dialog";
import type { LiveShiftBoardRowDto, AttendanceRecordDto } from "../types/shift-management.types";

// ── helpers ──

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function fmt(iso: string | null | undefined, fallback = "—") {
  if (!iso) return fallback;
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return fallback;
  }
}

// Sort priority: ABSENT=0, LATE=1, ACTIVE=2, SCHEDULED=3, COMPLETED=4, rest=5
const STATUS_PRIORITY: Record<string, number> = {
  ABSENT: 0,
  LATE: 1,
  ACTIVE: 2,
  SCHEDULED: 3,
  COMPLETED: 4,
};

function sortPriority(code: string): number {
  return STATUS_PRIORITY[code] ?? 5;
}

// ── summary card ──

interface SummaryCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
}

function SummaryCard({ label, value, icon, accent }: SummaryCardProps) {
  return (
    <Card className="py-4">
      <CardContent className="px-5 flex items-center gap-4">
        <div className={`rounded-full p-2 ${accent}`}>{icon}</div>
        <div>
          <p className="text-2xl font-bold leading-none">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── main component ──

export function ShiftLive() {
  const [businessDate, setBusinessDate] = useState(todayIso);
  const [adjustTarget, setAdjustTarget] = useState<AttendanceRecordDto | null>(null);

  const { data, isLoading, refetch, dataUpdatedAt } = useLiveDutyBoardQuery({ businessDate });
  const summary = data?.summary;
  const rows: LiveShiftBoardRowDto[] = useMemo(
    () =>
      [...(data?.rows ?? [])].sort(
        (a, b) =>
          sortPriority(a.attendanceStatusCode) - sortPriority(b.attendanceStatusCode)
      ),
    [data]
  );

  // Live filter
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = statusFilter
    ? rows.filter((r) => r.attendanceStatusCode === statusFilter)
    : rows;

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : null;

  return (
    <>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">Live On-Duty Board</h1>
            <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time attendance for today&apos;s shifts. Auto-refreshes every 30 s.
            {lastUpdated && <span className="ml-2 text-xs">Last updated: {lastUpdated}</span>}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Date picker */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground">Date:</label>
        <ALDatePicker
          value={businessDate}
          onChange={(val) => setBusinessDate(val)}
          placeholder="Select date"
          clearable
          inputSize="sm"
        />
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <SummaryCard
            label="Scheduled"
            value={summary.scheduled}
            icon={<Clock className="w-4 h-4 text-muted-foreground" />}
            accent="bg-muted"
          />
          <SummaryCard
            label="On Duty"
            value={summary.active}
            icon={<Zap className="w-4 h-4 text-primary" />}
            accent="bg-primary/10"
          />
          <SummaryCard
            label="Late"
            value={summary.late}
            icon={<AlertCircle className="w-4 h-4 text-destructive" />}
            accent="bg-destructive/10"
          />
          <SummaryCard
            label="Absent"
            value={summary.absent}
            icon={<Users className="w-4 h-4 text-destructive" />}
            accent="bg-destructive/10"
          />
          <SummaryCard
            label="Completed"
            value={summary.completed}
            icon={<CheckCircle2 className="w-4 h-4 text-green-600" />}
            accent="bg-green-50"
          />
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {["", "LATE", "ABSENT", "ACTIVE", "SCHEDULED", "COMPLETED"].map((code) => (
          <button
            key={code}
            onClick={() => setStatusFilter(code)}
            className={`px-3 py-1 rounded-full border transition-colors ${
              statusFilter === code
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
            }`}
          >
            {code === "" ? "All" : code.charAt(0) + code.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Board table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
          Loading board…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
          No attendance records for this date{statusFilter ? ` with status "${statusFilter}"` : ""}.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Staff</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Shift</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Planned</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Check-in</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Check-out</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Late (min)</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((r) => (
                <tr
                  key={r.shiftAssignmentId}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{r.staffName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.roleName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.shiftTypeCode}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {fmt(r.plannedStartAt)} – {fmt(r.plannedEndAt)}
                  </td>
                  <td className="px-4 py-3">{fmt(r.actualCheckInAt)}</td>
                  <td className="px-4 py-3">{fmt(r.actualCheckOutAt)}</td>
                  <td className="px-4 py-3">
                    <ShiftStatusBadge statusCode={r.attendanceStatusCode} type="attendance" />
                  </td>
                  <td className="px-4 py-3">
                    {r.lateMinutes > 0 ? (
                      <span className="text-destructive font-medium">{r.lateMinutes}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {r.attendanceId && (
                      <PermissionGuard permission={Permissions.AdjustAttendance}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 px-2"
                          onClick={() =>
                            setAdjustTarget({
                              attendanceId: r.attendanceId!,
                              shiftAssignmentId: r.shiftAssignmentId,
                              attendanceStatusLvId: 0,
                              attendanceStatusCode: r.attendanceStatusCode,
                              attendanceStatusName: r.attendanceStatusCode,
                              actualCheckInAt: r.actualCheckInAt,
                              actualCheckOutAt: r.actualCheckOutAt,
                              lateMinutes: r.lateMinutes,
                              earlyLeaveMinutes: 0,
                              workedMinutes: 0,
                              isManualAdjustment: false,
                              adjustmentReason: null,
                              reviewedByName: null,
                              reviewedAt: null,
                            })
                          }
                        >
                          Adjust
                        </Button>
                      </PermissionGuard>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>

    {adjustTarget && (
      <AttendanceAdjustmentDialog
        open={!!adjustTarget}
        onClose={() => setAdjustTarget(null)}
        attendanceRecord={adjustTarget}
        staffName={filtered.find((r) => r.attendanceId === adjustTarget.attendanceId)?.staffName}
      />
    )}
    </>
  );
}

