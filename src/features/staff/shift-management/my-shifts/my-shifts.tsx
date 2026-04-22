"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import {
  Clock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  LogIn,
  ShieldCheck,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useMyShiftsQuery } from "../hooks/use-shift-queries";
import { CheckInCard } from "../components/check-in-card";
import { useCheckoutAutoLogout } from "../hooks/use-checkout-auto-logout";
import { ALCard } from "@/components/ui/al-card";
import { ALTitleCard } from "@/components/ui/al-title-card";
import { Button } from "@/components/ui/button";
import {
  ATTENDANCE_STATUS_CONFIG,
  ShiftAssignmentListDto,
  ShiftAssignmentDetailDto,
} from "../types/shift-management.types";
import { dateUtils } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

// ── helpers ──

function buildDateOnly(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function toDateOnly(date: Date) {
  return buildDateOnly(date.getFullYear(), date.getMonth(), date.getDate());
}

function getSwissTodayIso(date: Date) {
  return dateUtils.formatLocal(date, "yyyy-MM-dd");
}

function getSwissWeekdayIndex(date: Date) {
  const isoWeekday = Number(dateUtils.formatLocal(date, "i"));
  return Number.isFinite(isoWeekday) ? isoWeekday - 1 : 0;
}

function getSwissYear(date: Date) {
  return Number(dateUtils.formatLocal(date, "yyyy"));
}

function getSwissMonthIndex(date: Date) {
  const month = Number(dateUtils.formatLocal(date, "M"));
  return Number.isFinite(month) ? month - 1 : 0;
}

function toMinutesBetween(
  startIso?: string | null,
  endIso?: string | null
) {
  if (!startIso || !endIso) return 0;
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0;
  return Math.round((end - start) / 60000);
}

function fmtTime(iso: string | null | undefined, fallback = "—") {
  if (!iso) return fallback;
  try {
    return dateUtils.formatLocal(iso, "HH:mm");
  } catch {
    return fallback;
  }
}

const WEEKDAY_HEADERS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function getCalendarAttendanceStatusCode(
  assignment: ShiftAssignmentListDto,
  now: Date
) {
  const attendance = assignment.attendance;
  const explicitStatus = attendance?.attendanceStatusCode?.toUpperCase();

  if (explicitStatus) return explicitStatus;
  if ((attendance?.lateMinutes ?? 0) > 0) return "LATE";
  if ((attendance?.earlyLeaveMinutes ?? 0) > 0) return "EARLY_LEAVE";
  if (attendance?.actualCheckInAt && !attendance?.actualCheckOutAt) return "ACTIVE";
  if (attendance?.actualCheckOutAt) return "COMPLETED";

  const swissToday = getSwissTodayIso(now);
  if (!assignment.isActive || assignment.workDate < swissToday) return "ABSENT";
  return "SCHEDULED";
}

function getCalendarAttendanceStatusLabel(
  assignment: ShiftAssignmentListDto,
  statusCode: string
) {
  return (
    assignment.attendance?.attendanceStatusName?.trim() ||
    ATTENDANCE_STATUS_CONFIG[statusCode]?.label ||
    statusCode
  );
}

function getCalendarStatusClasses(statusCode: string) {
  const code = statusCode.toUpperCase();

  if (code === "LATE" || code === "EARLY_LEAVE") {
    return {
      card: "border-amber-200 bg-amber-50/90 border-l-[3px] border-l-amber-500",
      status: "text-amber-700",
      icon: "text-amber-500",
    };
  }

  if (code === "ACTIVE" || code === "ON_DUTY") {
    return {
      card: "border-blue-200 bg-blue-50/90 border-l-[3px] border-l-blue-500",
      status: "text-blue-700",
      icon: "text-blue-500",
    };
  }

  if (code === "COMPLETED") {
    return {
      card: "border-emerald-200 bg-emerald-50/90 border-l-[3px] border-l-emerald-500",
      status: "text-emerald-700",
      icon: "text-emerald-500",
    };
  }

  if (code === "ABSENT") {
    return {
      card: "border-red-200 bg-red-50/90 border-l-[3px] border-l-red-500",
      status: "text-red-700",
      icon: "text-red-500",
    };
  }

  return {
    card: "border-slate-200 bg-slate-50/90 border-l-[3px] border-l-slate-400",
    status: "text-slate-600",
    icon: "text-slate-400",
  };
}

// ── month navigation ──

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstMondayOffset(year: number, month: number) {
  // Returns how many blank cells before day 1 (Monday-based: Mon=0, Tue=1, ..., Sun=6)
  const dayOfWeek = new Date(year, month, 1).getDay();
  // Convert Sunday=0 to 6, Mon=1 to 0, Tue=2 to 1, etc.
  return dayOfWeek === 0 ? 6 : dayOfWeek - 1;
}

// Get trailing days from next month to fill the last week row
function getTrailingDays(year: number, month: number) {
  const daysInMonth = getDaysInMonth(year, month);
  const lastDayOfWeek = new Date(year, month, daysInMonth).getDay();
  // Convert to Monday-based: Sun=0 -> 6
  const lastDowMondayBased = lastDayOfWeek === 0 ? 6 : lastDayOfWeek - 1;
  return lastDowMondayBased === 6 ? 0 : 6 - lastDowMondayBased;
}

// ── main component ──

export function MyShifts() {
  const t = useTranslations("shift.myShift");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const today = useMemo(() => getSwissTodayIso(now), [now]);
  const todayWeekdayIndex = useMemo(() => getSwissWeekdayIndex(now), [now]);

  // Auto-logout countdown after check-out
  const autoLogout = useCheckoutAutoLogout();

  // Month navigation: [year, monthIndex]
  const [viewYear, setViewYear] = useState(() => getSwissYear(new Date()));
  const [viewMonth, setViewMonth] = useState(() => getSwissMonthIndex(new Date()));

  // Load broader date range to cover the full month view
  const fromDate = useMemo(() => {
    const d = new Date(viewYear, viewMonth, 1);
    d.setDate(d.getDate() - 7); // buffer for prev month trailing days
    return toDateOnly(d);
  }, [viewYear, viewMonth]);

  const toDate = useMemo(() => {
    const d = new Date(viewYear, viewMonth + 1, 0);
    d.setDate(d.getDate() + 7); // buffer for next month leading days
    return toDateOnly(d);
  }, [viewYear, viewMonth]);

  const { data, isLoading } = useMyShiftsQuery({
    fromDate,
    toDate,
    pageSize: 200,
  });
  const all = useMemo(() => data?.pageData ?? [], [data]);

  // Group assignments by date
  const byDate = useMemo(() => {
    const map = new Map<string, ShiftAssignmentListDto[]>();
    all.forEach((a) => {
      if (!a.workDate) return;
      if (!map.has(a.workDate)) map.set(a.workDate, []);
      map.get(a.workDate)!.push(a);
    });
    return map;
  }, [all]);

  // Compute monthly stats
  const monthStats = useMemo(() => {
    const monthStart = buildDateOnly(viewYear, viewMonth, 1);
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const monthEnd = buildDateOnly(viewYear, viewMonth, daysInMonth);

    const monthAssignments = all.filter(
      (a) => a.workDate >= monthStart && a.workDate <= monthEnd
    );

    let totalWorkdays = 0;
    let overtimeMinutes = 0;
    let lateEarlyCount = 0;
    let leaveDays = 0;

    const processedDates = new Set<string>();

    monthAssignments.forEach((a) => {
      const att = a.attendance;

      const statusCode = att?.attendanceStatusCode?.toUpperCase();

      if (statusCode === "ABSENT" || !a.isActive) {
        if (!processedDates.has(a.workDate + "-leave")) {
          leaveDays += 1;
          processedDates.add(a.workDate + "-leave");
        }
        return;
      }

      if (att?.actualCheckInAt) {
        if (!processedDates.has(a.workDate + "-work")) {
          totalWorkdays += 1;
          processedDates.add(a.workDate + "-work");
        }
      }

      const plannedMinutes = toMinutesBetween(a.plannedStartAt, a.plannedEndAt);
      const workedMinutes = att?.workedMinutes ?? 0;
      if (workedMinutes > plannedMinutes) {
        overtimeMinutes += workedMinutes - plannedMinutes;
      }

      if ((att?.lateMinutes ?? 0) > 0 || (att?.earlyLeaveMinutes ?? 0) > 0) {
        lateEarlyCount += 1;
      }
    });

    return {
      totalWorkdays: totalWorkdays.toFixed(2),
      totalOvertimeHours: (overtimeMinutes / 60).toFixed(2),
      lateEarlyCount,
      leaveDays: leaveDays.toFixed(2),
    };
  }, [all, viewYear, viewMonth]);

  // Today's shifts for check-in display
  const todayShifts = useMemo(
    () => all.filter((a) => a.workDate === today),
    [all, today]
  );

  // Today's check-in time
  const todayCheckInTime = useMemo(() => {
    for (const a of todayShifts) {
      const att = a.attendance;
      if (att?.actualCheckInAt) return fmtTime(att.actualCheckInAt);
    }
    return null;
  }, [todayShifts]);

  // Edge case E-1: Only trigger auto-logout after the LAST today shift is checked out
  const handleCheckOutSuccess = useCallback(() => {
    // Count how many of today's shifts still need check-out (checked-in but not yet out)
    const uncheckedOutCount = todayShifts.filter((a) => {
      const att = a.attendance;
      return !!att?.actualCheckInAt && !att?.actualCheckOutAt;
    }).length;

    // This callback fires AFTER one check-out succeeds.
    // If this was the last remaining shift (count was 1 before, now 0 after invalidation)
    // we start the countdown. We check <= 1 because the query may not have refreshed yet.
    if (uncheckedOutCount <= 1) {
      autoLogout.startCountdown();
    }
  }, [todayShifts, autoLogout]);

  // Build calendar grid cells
  const calendarCells = useMemo(() => {
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const leadingBlanks = getFirstMondayOffset(viewYear, viewMonth);
    const trailingBlanks = getTrailingDays(viewYear, viewMonth);

    // Previous month trailing days
    const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    const prevDaysInMonth = getDaysInMonth(prevYear, prevMonth);

    type CalendarCell =
      | { kind: "prev"; day: number; dateIso: string }
      | { kind: "current"; day: number; dateIso: string }
      | { kind: "next"; day: number; dateIso: string };

    const cells: CalendarCell[] = [];

    // Leading blanks (prev month)
    for (let i = leadingBlanks - 1; i >= 0; i--) {
      const day = prevDaysInMonth - i;
      const dateIso = buildDateOnly(prevYear, prevMonth, day);
      cells.push({ kind: "prev", day, dateIso });
    }

    // Current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateIso = buildDateOnly(viewYear, viewMonth, day);
      cells.push({ kind: "current", day, dateIso });
    }

    // Next month trailing days
    const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    for (let i = 1; i <= trailingBlanks; i++) {
      const dateIso = buildDateOnly(nextYear, nextMonth, i);
      cells.push({ kind: "next", day: i, dateIso });
    }

    return cells;
  }, [viewYear, viewMonth]);

  // Month period label for dropdown
  const periodLabel = useMemo(() => {
    const firstDay = `01/${String(viewMonth + 1).padStart(2, "0")}/${viewYear}`;
    return t("timesheetPeriod", { date: firstDay });
  }, [viewYear, viewMonth, t]);

  // Navigation handlers
  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-4 overflow-y-auto xl:overflow-hidden">
      {/* ── Header ── */}
      <ALTitleCard
        title={t("title")}
        titleClassName="truncate"
        headerClassName="lg:items-center"
        className="border-slate-200 bg-white"
        bodyClassName="gap-0"
        actions={
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end xl:flex-nowrap">
            


            <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-white p-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-slate-700"
                onClick={() => setViewYear((year) => year - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-12 px-1 text-center text-sm font-medium tabular-nums text-[#1A3A52]">
                {viewYear}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-slate-700"
                onClick={() => setViewYear((year) => year + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-white p-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-slate-700"
                onClick={goToPrevMonth}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="min-w-50 px-2 text-center text-sm text-slate-600 truncate">
                {periodLabel}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-slate-700"
                onClick={goToNextMonth}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 text-slate-400 hover:text-slate-700"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      {/* ── Side-by-side layout: Calendar (left) + Attendance (right) ── */}
      <div className="grid flex-1 grid-cols-1 gap-4 xl:min-h-0 xl:grid-cols-[minmax(0,1fr)_380px] xl:overflow-hidden">
        {/* ── LEFT COLUMN: Stats + Calendar ── */}
        <div className="order-2 flex min-w-0 flex-col gap-4 xl:order-1 xl:min-h-0">
          {/* ── Summary stat cards ── */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {/* Total actual workdays */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div>
                <p className="text-xs text-slate-500">{t("stats.totalWorkdays")}</p>
                <p className="text-xl font-bold text-slate-900 tabular-nums mt-0.5">
                  {monthStats.totalWorkdays}
                </p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                <CalendarDays className="h-4 w-4 text-emerald-600" />
              </div>
            </div>

            {/* Total overtime hours */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div>
                <p className="text-xs text-slate-500">{t("stats.totalOvertimeHours")}</p>
                <p className="text-xl font-bold text-slate-900 tabular-nums mt-0.5">
                  {monthStats.totalOvertimeHours}
                </p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
            </div>

            {/* Total late arrivals and early departures */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div>
                <p className="text-xs text-slate-500">{t("stats.totalLateEarly")}</p>
                <p className="text-xl font-bold text-slate-900 tabular-nums mt-0.5">
                  {monthStats.lateEarlyCount}
                </p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                <div className="h-4 w-4 rounded-full bg-amber-500" />
              </div>
            </div>

            {/* Total leave days */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div>
                <p className="text-xs text-slate-500">{t("stats.totalLeaveDays")}</p>
                <p className="text-xl font-bold text-slate-900 tabular-nums mt-0.5">
                  {monthStats.leaveDays}
                </p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
                <CalendarDays className="h-4 w-4 text-red-500" />
              </div>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-3 xl:min-h-0">
            {/* ── Monthly Calendar ── */}
            {isLoading ? (
              <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white py-20 text-sm text-slate-400 xl:flex-1">
                {t("loading")}
              </div>
            ) : (
              <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-slate-200 bg-white">
                <table className="min-w-180 w-full table-fixed border-collapse">
                <thead>
                  <tr>
                    {WEEKDAY_HEADERS.map((day, i) => (
                      <th
                        key={day}
                        className={cn(
                          "border-b border-r border-slate-200 px-1 py-2 text-center text-[11px] font-semibold",
                          i === 5 || i === 6
                            ? "text-red-500"
                            : "text-slate-600"
                        )}
                        style={
                          todayWeekdayIndex === i
                            ? { backgroundColor: "#6366f1", color: "white" }
                            : {}
                        }
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from(
                    { length: Math.ceil(calendarCells.length / 7) },
                    (_, weekIdx) => {
                      const weekCells = calendarCells.slice(
                        weekIdx * 7,
                        weekIdx * 7 + 7
                      );
                      return (
                        <tr key={weekIdx}>
                          {weekCells.map((cell, colIdx) => {
                            const isWeekend = colIdx === 5 || colIdx === 6;
                            const isToday = cell.dateIso === today;
                            const isOtherMonth = cell.kind !== "current";
                            const assignments = byDate.get(cell.dateIso) ?? [];

                            return (
                              <td
                                key={cell.dateIso}
                                className={cn(
                                  "relative h-28 border-b border-r border-slate-200 p-1 align-top transition-colors lg:h-32",
                                  isWeekend && "bg-[repeating-linear-gradient(135deg,transparent,transparent_3px,rgba(0,0,0,0.03)_3px,rgba(0,0,0,0.03)_6px)]",
                                  isToday && "ring-2 ring-inset ring-indigo-500",
                                  isOtherMonth && "opacity-40"
                                )}
                              >
                                {/* Day number */}
                                <span
                                  className={cn(
                                    "absolute top-1 right-1.5 text-[11px] font-medium tabular-nums",
                                    isToday
                                      ? "text-indigo-600 font-bold"
                                      : isWeekend
                                        ? "text-red-400"
                                        : "text-slate-500"
                                  )}
                                >
                                  {String(cell.day).padStart(2, "0")}
                                </span>

                                {/* Shift indicators */}
                                {assignments.length > 0 && (
                                  <div className="mt-5 space-y-1">
                                    {assignments.slice(0, 2).map((a) => {
                                      const statusCode = getCalendarAttendanceStatusCode(a, now);
                                      const statusLabel = getCalendarAttendanceStatusLabel(
                                        a,
                                        statusCode
                                      );
                                      const statusClasses = getCalendarStatusClasses(statusCode);
                                      return (
                                        <ALCard
                                          key={a.shiftAssignmentId}
                                          variant="default"
                                          elevation="none"
                                          radius="md"
                                          padding="none"
                                          className={cn(
                                            "space-y-1 px-2 py-1.5",
                                            statusClasses.card
                                          )}
                                        >
                                          <p className="truncate text-[10px] font-semibold leading-4 text-slate-800">
                                            {a.templateName || `#${a.shiftAssignmentId}`}
                                          </p>
                                          <div className="flex items-center gap-1 text-[10px] leading-4 text-slate-500">
                                            <Clock className="h-3 w-3 shrink-0" />
                                            <span className="truncate">
                                              {fmtTime(a.plannedStartAt)} - {fmtTime(a.plannedEndAt)}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1 text-[10px] leading-4 text-slate-600">
                                            <LogIn
                                              className={cn(
                                                "h-3 w-3 shrink-0",
                                                statusClasses.icon
                                              )}
                                            />
                                            <span className="shrink-0 tabular-nums">
                                              {fmtTime(a.attendance?.actualCheckInAt)}
                                            </span>
                                            <span className="text-slate-300">•</span>
                                            <span
                                              className={cn(
                                                "min-w-0 truncate font-semibold",
                                                statusClasses.status
                                              )}
                                            >
                                              {statusLabel}
                                            </span>
                                          </div>
                                        </ALCard>
                                      );
                                    })}
                                    {assignments.length > 2 && (
                                      <p className="text-center text-[10px] font-medium text-slate-400">
                                        +{assignments.length - 2}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    }
                  )}
                </tbody>
                </table>
              </div>
            )}

            {/* ── Auto-sync note ── */}
            <p className="text-xs italic text-slate-400">{t("autoSyncNote")}</p>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Attendance + Auto-logout ── */}
        <div className="order-1 flex min-w-0 flex-col gap-4 xl:order-2 xl:min-h-0 xl:overflow-y-auto xl:pr-1">
          {/* ── Auto-logout countdown banner ── */}
          {autoLogout.isCountingDown && (
            <div className="flex flex-col gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-200 shrink-0">
                  <LogOut className="h-4 w-4 text-amber-700" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-amber-900">
                    {t("autoLogout.bannerTitle", { time: autoLogout.remainingLabel })}
                  </p>
                  <p className="text-xs text-amber-700">
                    {t("autoLogout.bannerMessage")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-400 text-amber-800 hover:bg-amber-100"
                  onClick={autoLogout.cancelCountdown}
                >
                  <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                  {t("autoLogout.stay")}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={autoLogout.logoutNow}
                >
                  <LogOut className="mr-1.5 h-3.5 w-3.5" />
                  {t("autoLogout.logoutNow")}
                </Button>
              </div>
            </div>
          )}

          {/* ── Today's Attendance Zone ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-[#1A3A52]">
                {t("todayAttendance.title")}
              </h2>
              {todayCheckInTime && (
                <span className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
                  <Clock className="h-3 w-3" />
                  {t("checkedInTodayAt")}
                  <span className="font-medium text-slate-700">{todayCheckInTime}</span>
                </span>
              )}
            </div>

            {todayShifts.length > 0 ? (
              <div className="grid gap-3 grid-cols-1">
                {todayShifts.map((a) => (
                  <CheckInCard
                    key={a.shiftAssignmentId}
                    assignment={a as ShiftAssignmentDetailDto}
                    onCheckOutSuccess={handleCheckOutSuccess}
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 py-8 text-sm text-slate-400">
                {t("todayAttendance.noShiftsToday")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

