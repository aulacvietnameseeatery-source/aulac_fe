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
  cardClass?: string;
  valueClass?: string;
  labelClass?: string;
}

function SummaryCard({ label, value, icon, accent, cardClass, valueClass, labelClass }: SummaryCardProps) {
  return (
    <Card className={`py-4 border-[#D5BA98]/50 bg-[#FDFBF9] shadow-none ${cardClass ?? ""}`}>
      <CardContent className="px-5 flex items-center gap-4">
        <div className={`rounded-full p-2 border border-[#D5BA98]/40 ${accent}`}>{icon}</div>
        <div>
          <p className={`text-2xl font-semibold leading-none text-[#1A3A52] ${valueClass ?? ""}`}>{value}</p>
          <p className={`text-xs text-[#1A3A52]/70 mt-0.5 ${labelClass ?? ""}`}>{label}</p>
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
    <div className="space-y-6 rounded-2xl border border-[#D5BA98]/40 bg-linear-to-b from-[#FDFBF9] via-[#D5BA98]/10 to-[#FDFBF9] p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-wide text-[#1A3A52]">Live On-Duty Board</h1>
            <span className="flex items-center gap-1 rounded-full border border-[#D5BA98]/60 bg-[#D5BA98]/20 px-2 py-0.5 text-xs font-medium text-[#1A3A52]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1A3A52] animate-pulse" />
              Live
            </span>
          </div>
          <p className="mt-0.5 text-sm text-[#1A3A52]/70">
            Real-time attendance for today&apos;s shifts. Auto-refreshes every 30 s.
            {lastUpdated && <span className="ml-2 text-xs text-[#1A3A52]/60">Last updated: {lastUpdated}</span>}
          </p>
        </div>
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

      {/* Date picker */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-[#1A3A52]/70">Date:</label>
        <ALDatePicker
          value={businessDate}
          onChange={(val) => setBusinessDate(val)}
          placeholder="Select date"
          clearable
          inputSize="sm"
          wrapperClassName="w-38"
        />
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <SummaryCard
            label="Scheduled"
            value={summary.scheduled}
            icon={<Clock className="w-4 h-4 text-[#1A3A52]/70" />}
            accent="bg-[#D5BA98]/20"
          />
          <SummaryCard
            label="On Duty"
            value={summary.active}
            icon={<Zap className="w-4 h-4 text-[#1A3A52]" />}
            accent="bg-[#1A3A52]/10"
            cardClass="bg-[#1A3A52]/5"
          />
          <SummaryCard
            label="Late"
            value={summary.late}
            icon={<AlertCircle className="w-4 h-4 text-[#8C3A3A]" />}
            accent="bg-[#8C3A3A]/10"
          />
          <SummaryCard
            label="Absent"
            value={summary.absent}
            icon={<Users className="w-4 h-4 text-[#8C3A3A]" />}
            accent="bg-[#8C3A3A]/10"
          />
          <SummaryCard
            label="Completed"
            value={summary.completed}
            icon={<CheckCircle2 className="w-4 h-4 text-[#4A5D4E]" />}
            accent="bg-[#D5BA98]/25"
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
                ? "border-[#1A3A52] bg-[#1A3A52] text-[#FDFBF9]"
                : "border-[#D5BA98]/70 bg-[#FDFBF9] text-[#1A3A52]/70 hover:border-[#1A3A52]/40 hover:text-[#1A3A52]"
            }`}
          >
            {code === "" ? "All" : code.charAt(0) + code.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Board table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-sm text-[#1A3A52]/70">
          Loading board…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-sm text-[#1A3A52]/70">
          No attendance records for this date{statusFilter ? ` with status "${statusFilter}"` : ""}.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#D5BA98]/60 bg-[#FDFBF9]">
          <table className="w-full text-sm">
            <thead className="bg-[#D5BA98]/20">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-[#1A3A52]/80">Staff</th>
                <th className="px-4 py-3 text-left font-medium text-[#1A3A52]/80">Role</th>
                <th className="px-4 py-3 text-left font-medium text-[#1A3A52]/80">Shift</th>
                <th className="px-4 py-3 text-left font-medium text-[#1A3A52]/80">Planned</th>
                <th className="px-4 py-3 text-left font-medium text-[#1A3A52]/80">Check-in</th>
                <th className="px-4 py-3 text-left font-medium text-[#1A3A52]/80">Check-out</th>
                <th className="px-4 py-3 text-left font-medium text-[#1A3A52]/80">Status</th>
                <th className="px-4 py-3 text-left font-medium text-[#1A3A52]/80">Late (min)</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D5BA98]/40">
              {filtered.map((r) => (
                <tr
                  key={r.shiftAssignmentId}
                  className="transition-colors hover:bg-[#D5BA98]/15"
                >
                  <td className="px-4 py-3 font-medium text-[#1A3A52]">{r.staffName}</td>
                  <td className="px-4 py-3 text-[#1A3A52]/70">{r.roleName}</td>
                  <td className="px-4 py-3 text-[#1A3A52]/70">{r.shiftTypeCode}</td>
                  <td className="px-4 py-3 text-[#1A3A52]/70">
                    {fmt(r.plannedStartAt)} – {fmt(r.plannedEndAt)}
                  </td>
                  <td className="px-4 py-3 text-[#1A3A52]">{fmt(r.actualCheckInAt)}</td>
                  <td className="px-4 py-3 text-[#1A3A52]">{fmt(r.actualCheckOutAt)}</td>
                  <td className="px-4 py-3">
                    <ShiftStatusBadge statusCode={r.attendanceStatusCode} type="attendance" />
                  </td>
                  <td className="px-4 py-3">
                    {r.lateMinutes > 0 ? (
                      <span className="font-medium text-[#8C3A3A]">{r.lateMinutes}</span>
                    ) : (
                      <span className="text-[#1A3A52]/50">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {r.attendanceId && (
                      <PermissionGuard permission={Permissions.AdjustAttendance}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 border-[#D5BA98]/70 bg-[#FDFBF9] px-2 text-xs text-[#1A3A52] hover:bg-[#D5BA98]/20"
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

