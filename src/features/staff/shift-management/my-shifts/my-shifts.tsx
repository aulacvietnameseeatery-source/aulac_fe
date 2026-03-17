"use client";

import { useState, useMemo } from "react";
import { RefreshCcw, CalendarDays, ArrowRightLeft, CalendarX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMyShiftsQuery } from "../hooks/use-shift-queries";
import { CheckInCard } from "../components/check-in-card";
import { ShiftStatusBadge } from "../components/shift-status-badge";
import type { ShiftAssignmentListDto } from "../types/shift-management.types";

// ── helpers ──

function todayIso() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function fmt(iso: string | null | undefined, fallback = "—") {
  if (!iso) return fallback;
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return fallback;
  }
}

type DayStatus = "ON_TIME" | "LATE" | "OT" | "INCOMING" | "NONE";

function toMinutesBetween(startIso?: string | null, endIso?: string | null) {
  if (!startIso || !endIso) return 0;
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0;
  return Math.round((end - start) / 60000);
}

function dayStatusClass(status: DayStatus) {
  if (status === "ON_TIME") return "border-blue-500 bg-blue-500 text-white";
  if (status === "LATE") return "border-amber-500 bg-amber-500 text-white";
  if (status === "OT") return "border-emerald-500 bg-emerald-500 text-white";
  if (status === "INCOMING") return "border-slate-600 bg-slate-600 text-white";
  return "border border-[#D5BA98]/60 bg-white text-slate-400";
}

function dayStatusLabel(status: DayStatus) {
  if (status === "ON_TIME") return "On time";
  if (status === "LATE") return "Late";
  if (status === "OT") return "OT";
  if (status === "INCOMING") return "Incoming";
  return "No shift";
}

function pickDayStatus(statuses: DayStatus[]): DayStatus {
  if (statuses.includes("OT")) return "OT";
  if (statuses.includes("LATE")) return "LATE";
  if (statuses.includes("ON_TIME")) return "ON_TIME";
  if (statuses.includes("INCOMING")) return "INCOMING";
  return "NONE";
}

function getAssignmentStatus(a: ShiftAssignmentListDto, now: Date): DayStatus {
  const att = (a as ShiftAssignmentListDto & {
    attendance?: { lateMinutes?: number; workedMinutes?: number; actualCheckInAt?: string | null; attendanceStatusCode?: string };
  }).attendance;

  if (!a.workDate) return "NONE";
  const nowIsoDate = now.toISOString().slice(0, 10);
  if (a.workDate > nowIsoDate) return "INCOMING";

  const statusCode = att?.attendanceStatusCode?.toUpperCase();
  const lateMinutes = att?.lateMinutes ?? 0;
  const workedMinutes = att?.workedMinutes ?? 0;
  const plannedMinutes = toMinutesBetween(a.plannedStartAt, a.plannedEndAt);

  if (statusCode === "LATE" || lateMinutes > 0) return "LATE";
  if (workedMinutes > 0 && plannedMinutes > 0 && workedMinutes > plannedMinutes) return "OT";
  if (statusCode === "COMPLETED" || !!att?.actualCheckInAt) return "ON_TIME";
  if (a.workDate === nowIsoDate) return "INCOMING";
  return "NONE";
}

// ── sub-components ──

function ShiftRow({ a }: { a: ShiftAssignmentListDto }) {
  const [isHovered, setIsHovered] = useState(false);
  const isIncoming = a.workDate && a.workDate >= todayIso();

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex items-center justify-between rounded-lg border border-[#D5BA98]/60 bg-white px-4 py-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md h-16"
    >
      <div className="space-y-0.5 min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#1A3A52]">{a.templateName ?? `Assignment #${a.shiftAssignmentId}`}</p>
        <p className="text-xs text-[#1A3A52]/70">
          {a.workDate} · {fmt(a.plannedStartAt)} – {fmt(a.plannedEndAt)}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-3 h-full">
        {isHovered && isIncoming && a.isActive ? (
          <div className="flex gap-1 animate-in fade-in zoom-in duration-200">
            <Button size="sm" variant="outline" className="h-8 gap-1 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800">
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Swap
            </Button>
            <Button size="sm" variant="outline" className="h-8 gap-1 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800">
              <CalendarX className="w-3.5 h-3.5" />
              Leave
            </Button>
          </div>
        ) : (
          <ShiftStatusBadge statusCode={a.isActive ? "active" : "cancelled"} type="assignment" />
        )}
      </div>
    </div>
  );
}

// ── main component ──

export function MyShifts() {
  const today = todayIso();
  const now = useMemo(() => new Date(), []);

  // Load last 30 and next 30 days
  const fromDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  }, []);

  const toDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  }, []);

  const { data, isLoading, refetch } = useMyShiftsQuery({ fromDate, toDate, pageSize: 100 });
  const all = useMemo(() => data?.pageData ?? [], [data]);

  // Partition: today / upcoming / past
  const todayShifts = useMemo(
    () => all.filter((a) => a.workDate === today),
    [all, today]
  );

  const upcoming = useMemo(
    () =>
      all
        .filter((a) => a.workDate && a.workDate > today)
        .sort((a, b) => (a.workDate ?? "").localeCompare(b.workDate ?? "")),
    [all, today]
  );

  const past = useMemo(
    () =>
      all
        .filter((a) => a.workDate && a.workDate < today)
        .sort((a, b) => (b.workDate ?? "").localeCompare(a.workDate ?? "")),
    [all, today]
  );

  const monthlyAssignments = useMemo(() => {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
    return all.filter((a) => a.workDate >= monthStart && a.workDate <= monthEnd);
  }, [all, now]);

  const monthlySummary = useMemo(() => {
    let onTime = 0;
    let late = 0;
    let ot = 0;
    let incoming = 0;

    monthlyAssignments.forEach((a) => {
      const st = getAssignmentStatus(a, now);
      if (st === "ON_TIME") onTime += 1;
      else if (st === "LATE") late += 1;
      else if (st === "OT") ot += 1;
      else if (st === "INCOMING") incoming += 1;
    });

    return {
      total: monthlyAssignments.length,
      onTime,
      late,
      ot,
      incoming,
      estimatedEarnings: monthlyAssignments.length * 350000, // Dummy calculation: ~350k VND per shift
    };
  }, [monthlyAssignments, now]);

  const dayCards = useMemo(() => {
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekday = new Date(year, month, 1).getDay();

    const byDate = new Map<string, ShiftAssignmentListDto[]>();
    monthlyAssignments.forEach((a) => {
      if (!byDate.has(a.workDate)) byDate.set(a.workDate, []);
      byDate.get(a.workDate)!.push(a);
    });

    const cells: Array<
      | { kind: "empty"; key: string }
      | { kind: "day"; key: string; day: number; status: DayStatus; count: number }
    > = [];

    for (let i = 0; i < firstWeekday; i += 1) {
      cells.push({ kind: "empty", key: `empty-${i}` });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day).toISOString().slice(0, 10);
      const assignments = byDate.get(date) ?? [];
      const status = pickDayStatus(assignments.map((a) => getAssignmentStatus(a, now)));

      cells.push({
        kind: "day",
        key: date,
        day,
        status,
        count: assignments.length,
      });
    }

    return cells;
  }, [monthlyAssignments, now]);

  return (
    <div className="space-y-6 rounded-2xl border border-[#D5BA98]/40 bg-[#FDFBF9] p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between rounded-xl border border border-[#D5BA98]/60 bg-white px-4 py-4 shadow-sm sm:px-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-wide text-[#1A3A52]">My Shifts</h1>
          <p className="mt-1 text-sm text-[#1A3A52]/70">
            View your assigned shifts and check in or check out.
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

      {isLoading ? (
        <div className="flex items-center justify-center rounded-xl border border border-[#D5BA98]/60 bg-white py-20 text-sm text-[#1A3A52]/70 shadow-sm">
          Loading shifts…
        </div>
      ) : all.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border border-[#D5BA98]/60 bg-white py-20 text-[#1A3A52]/70 shadow-sm">
          <CalendarDays className="w-10 h-10" />
          <p className="text-sm">No shifts assigned in the next 30 days.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
          {/* LEFT COLUMN: Summary & Calendar */}
          <div className="space-y-6 lg:col-span-5 xl:col-span-4 lg:sticky lg:top-6">
            <section className="space-y-4 rounded-xl border border border-[#D5BA98]/60 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-[#1A3A52]">This Month Summary</h2>
                <p className="text-xs text-[#1A3A52]/65">Attendance overview</p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-2.5">
                  <p className="text-[10px] sm:text-xs text-blue-700/80">On Time</p>
                  <p className="text-lg font-semibold text-blue-700">{monthlySummary.onTime}</p>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5">
                  <p className="text-[10px] sm:text-xs text-amber-700/80">Late</p>
                  <p className="text-lg font-semibold text-amber-700">{monthlySummary.late}</p>
                </div>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5">
                  <p className="text-[10px] sm:text-xs text-emerald-700/80">OT</p>
                  <p className="text-lg font-semibold text-emerald-700">{monthlySummary.ot}</p>
                </div>
                <div className="rounded-lg border border border-[#D5BA98]/60 bg-slate-50 p-2.5">
                  <p className="text-[10px] sm:text-xs text-slate-700/80">Incoming</p>
                  <p className="text-lg font-semibold text-slate-700">{monthlySummary.incoming}</p>
                </div>
                <div className="col-span-2 sm:col-span-4 flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 pt-2 pb-2">
                  <p className="text-xs font-medium text-emerald-800">Est. Earnings</p>
                  <p className="text-base font-bold text-emerald-700">~{monthlySummary.estimatedEarnings.toLocaleString()} đ</p>
                </div>
              </div>

              <hr className="border-slate-100" />

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="outline" className="border-blue-500 bg-blue-500 text-white text-[9px] px-1.5 py-0">On time</Badge>
                  <Badge variant="outline" className="border-amber-500 bg-amber-500 text-white text-[9px] px-1.5 py-0">Late</Badge>
                  <Badge variant="outline" className="border-emerald-500 bg-emerald-500 text-white text-[9px] px-1.5 py-0">OT</Badge>
                  <Badge variant="outline" className="border-slate-600 bg-slate-600 text-white text-[9px] px-1.5 py-0">Incoming</Badge>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {dayCards.map((cell) =>
                    cell.kind === "empty" ? (
                      <div key={cell.key} className="h-10 rounded-md border border-transparent" />
                    ) : (
                      <div
                        key={cell.key}
                        className="flex flex-col items-center justify-center rounded-md border border border-[#D5BA98]/60 bg-[#FDFBF9] py-1 shadow-sm transition-colors hover:bg-slate-100"
                        title={`${cell.count} shift(s)`}
                      >
                        <span className="text-xs font-semibold text-[#1A3A52]">{cell.day}</span>
                        <div className={`mt-0.5 h-1.5 w-1.5 rounded-full ${cell.status === "NONE" ? "bg-transparent" : dayStatusClass(cell.status).split(' ')[1]}`} />
                      </div>
                    )
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Today, Upcoming, Past */}
          <div className="space-y-6 lg:col-span-7 xl:col-span-8">
            {/* Today */}
            {todayShifts.length > 0 && (
              <section className="space-y-3 rounded-xl border border border-[#D5BA98]/60 bg-white p-4 shadow-sm">
                <h2 className="text-base font-semibold text-[#1A3A52]">Today</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {todayShifts.map((a) => (
                    <CheckInCard key={a.shiftAssignmentId} assignment={a as import("../types/shift-management.types").ShiftAssignmentDetailDto} />
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming */}
            {upcoming.length > 0 && (
              <section className="space-y-3 rounded-xl border border border-[#D5BA98]/60 bg-white p-4 shadow-sm">
                <h2 className="text-base font-semibold text-[#1A3A52]">Upcoming ({upcoming.length})</h2>
                <div className="space-y-2">
                  {upcoming.map((a) => (
                    <ShiftRow key={a.shiftAssignmentId} a={a} />
                  ))}
                </div>
              </section>
            )}

            {/* Past */}
            {past.length > 0 && (
              <section className="space-y-3 rounded-xl border border border-[#D5BA98]/60 bg-white p-4 shadow-sm">
                <h2 className="text-base font-semibold text-[#1A3A52]/70">Past Shifts ({past.length})</h2>
                <div className="space-y-2">
                  {past.map((a) => (
                    <ShiftRow key={a.shiftAssignmentId} a={a} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

