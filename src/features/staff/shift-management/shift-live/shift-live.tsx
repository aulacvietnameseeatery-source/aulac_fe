"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Clock3,
  LogIn,
  LogOut,
  RefreshCcw,
  TimerReset,
  UserRound,
  Wallet,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ALDatePicker } from "@/components/ui/al-date-picker";
import { ALCard } from "@/components/ui/al-card";
import { cn } from "@/lib/utils";
import { PermissionGuard } from "@/components/permission-guard";
import { Permissions } from "@/types/const";
import { useShiftAssignmentsQuery, useShiftLiveBoardQuery, useCheckInMutation, useCheckOutMutation } from "../hooks/use-shift-queries";
import { useShiftLiveBoardRealtime } from "../hooks/use-shift-live-board-realtime";
import { ShiftStatusBadge } from "../components/shift-status-badge";
import { dateUtils } from "@/lib/date-utils";
import type {
  ShiftAssignmentListDto,
  ShiftLiveBoardItemDto,
} from "../types/shift-management.types";

// ── helpers ──

type LiveFilter = "ALL" | "URGENT" | "ON_DUTY" | "WAITING" | "COMPLETED";
type TranslateFn = (key: string, values?: Record<string, string | number>) => string;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

// _OLD: function fmt(iso, fallback) — replaced by dateUtils.formatLocal
function fmt(iso: string | null | undefined, fallback = "—") {
  if (!iso) return fallback;
  try {
    return dateUtils.formatLocal(iso, "HH:mm");
  } catch {
    return fallback;
  }
}

function fmtCurrency(value: number | null | undefined, fallback: string) {
  if (value == null) return fallback;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function fmtDuration(totalMinutes: number) {
  if (totalMinutes <= 0) return "0m";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes}m`;
  if (minutes <= 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function getElapsedMinutes(row: ShiftLiveBoardItemDto) {
  if (row.workedMinutes > 0) {
    return row.workedMinutes;
  }
  if (!row.actualCheckInAt || row.actualCheckOutAt) {
    return 0;
  }

  const startedAt = new Date(row.actualCheckInAt).getTime();
  if (Number.isNaN(startedAt)) {
    return 0;
  }

  return Math.max(Math.floor((Date.now() - startedAt) / 60_000), 0);
}

function getVisualTone(row: ShiftLiveBoardItemDto) {
  if (row.hasAlert || row.issueCount > 0) {
    return {
      cardClass: "border-red-200 bg-white",
      accentClass: "border-l-red-600",
      badgeClass: "border-red-600 bg-red-600 text-white",
      mutedClass: "text-red-700",
    };
  }

  if (row.liveStatusCode === "WAITING") {
    return {
      cardClass: "border-slate-200 bg-white/90 opacity-75",
      accentClass: "border-l-slate-400",
      badgeClass: "border-slate-500 bg-slate-100 text-slate-700",
      mutedClass: "text-slate-600",
    };
  }

  if (row.liveStatusCode === "COMPLETED") {
    return {
      cardClass: "border-emerald-200 bg-white",
      accentClass: "border-l-emerald-600",
      badgeClass: "border-emerald-600 bg-emerald-600 text-white",
      mutedClass: "text-emerald-700",
    };
  }

  return {
    cardClass: "border-emerald-200 bg-white",
    accentClass: "border-l-emerald-600",
    badgeClass: "border-emerald-600 bg-emerald-600 text-white",
    mutedClass: "text-emerald-700",
  };
}

function getRoleBadgeClass(roleCode: string | null | undefined, roleName: string) {
  const normalized = `${roleCode ?? ""} ${roleName}`.trim().toLowerCase();

  if (normalized.includes("thu ngan") || normalized.includes("cash")) {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }
  if (normalized.includes("pha che") || normalized.includes("bar")) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  if (normalized.includes("phuc vu") || normalized.includes("server") || normalized.includes("waiter")) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  return "border-[#D5BA98]/70 bg-[#D5BA98]/15 text-[#1A3A52]";
}

function getActivityLabel(row: ShiftLiveBoardItemDto, t: TranslateFn) {
  if (row.currentTaskLabel) {
    return row.currentTaskLabel;
  }

  const normalizedRole = `${row.staffRoleCode} ${row.staffRoleName}`.trim().toLowerCase();

  if (row.liveStatusCode === "WAITING") {
    return t("activity.waiting");
  }
  if (row.liveStatusCode === "COMPLETED") {
    return t("activity.completed");
  }
  if (row.liveStatusCode === "NOT_CHECKED_IN") {
    return t("activity.notCheckedIn");
  }
  if (normalizedRole.includes("thu ngan") || normalizedRole.includes("cash")) {
    return row.currentLocationLabel ?? t("activity.cashierFallback");
  }
  if (normalizedRole.includes("pha che") || normalizedRole.includes("bar")) {
    return row.currentLocationLabel ?? t("activity.barFallback");
  }
  if (normalizedRole.includes("phuc vu") || normalizedRole.includes("server") || normalizedRole.includes("waiter")) {
    return row.currentLocationLabel ?? t("activity.serverFallback");
  }
  return row.currentLocationLabel ?? t("activity.defaultFallback");
}

function getPerformanceLabel(row: ShiftLiveBoardItemDto, t: TranslateFn) {
  const normalizedRole = `${row.staffRoleCode} ${row.staffRoleName}`.trim().toLowerCase();

  if (normalizedRole.includes("thu ngan") || normalizedRole.includes("cash")) {
    if (row.currentRevenue != null) {
      return t("performance.currentRevenue", { amount: fmtCurrency(row.currentRevenue, t("performance.waitingSync")) });
    }
    if (row.paidBillsCount != null) {
      return t("performance.paidBills", { count: row.paidBillsCount });
    }
    return t("performance.waitingSync");
  }

  if (normalizedRole.includes("pha che") || normalizedRole.includes("bar")) {
    if (row.itemsCompletedCount != null || row.pendingTicketsCount != null) {
      return t("performance.barStats", {
        completed: row.itemsCompletedCount ?? 0,
        pending: row.pendingTicketsCount ?? 0,
      });
    }
    return t("performance.barWaitingSync");
  }

  if (row.ordersHandledCount != null) {
    return t("performance.ordersHandled", { count: row.ordersHandledCount });
  }

  return t("performance.defaultWaitingSync");
}

function getWarningLabel(row: ShiftLiveBoardItemDto, t: TranslateFn) {
  if (row.lateMinutes > 0) {
    return t("warning.late", { minutes: row.lateMinutes });
  }
  if (row.earlyLeaveMinutes > 0) {
    return t("warning.earlyLeave", { minutes: row.earlyLeaveMinutes });
  }
  if (row.liveStatusCode === "NOT_CHECKED_IN") {
    return t("warning.notCheckedIn");
  }
  if (row.actualCheckInAt) {
    return t("warning.checkedInAt", { time: fmt(row.actualCheckInAt) });
  }
  return null;
}

function matchesFilter(row: ShiftLiveBoardItemDto, filter: LiveFilter) {
  if (filter === "ALL") return true;
  if (filter === "URGENT") return row.hasAlert || row.issueCount > 0;
  if (filter === "ON_DUTY") return row.liveStatusCode === "ON_DUTY";
  if (filter === "WAITING") return row.liveStatusCode === "WAITING";
  return row.liveStatusCode === "COMPLETED";
}

function sortPriority(row: ShiftLiveBoardItemDto) {
  if (row.hasAlert || row.issueCount > 0) return 0;
  if (row.liveStatusCode === "ON_DUTY") return 1;
  if (row.liveStatusCode === "WAITING") return 2;
  if (row.liveStatusCode === "COMPLETED") return 3;
  return 4;
}

// _OLD: Previous table-based live board kept for rollback/reference.
function ShiftLiveTable_DEPRECATED() {
  const [businessDate, setBusinessDate] = useState(todayIso);

  const { data, isLoading, refetch, dataUpdatedAt } = useShiftAssignmentsQuery({
    fromDate: businessDate,
    toDate: businessDate,
    pageSize: 200,
  });

  const rows: ShiftAssignmentListDto[] = useMemo(
    () =>
      [...(data?.pageData ?? [])].sort(
        (a, b) => (a.plannedStartAt || "").localeCompare(b.plannedStartAt || "")
      ),
    [data]
  );

  // Live filter
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = statusFilter === "ALL"
    ? rows
    : rows.filter((r) => r.isActive === (statusFilter === "ACTIVE"));

  function statusFilterClass(code: string, active: boolean) {
    if (!active) {
      return "border-slate-300 bg-white text-slate-700 hover:bg-slate-100";
    }
    if (code === "ACTIVE") {
      return "border-emerald-600 bg-emerald-600 text-white";
    }
    if (code === "CANCELLED") {
      return "border-red-600 bg-red-600 text-white";
    }
    return "border-slate-700 bg-slate-700 text-white";
  }

  const lastUpdated = dataUpdatedAt
    ? dateUtils.formatLocal(new Date(dataUpdatedAt), "HH:mm:ss")
    : null;

  return (
    <div className="space-y-6 rounded-2xl border border-[#D5BA98]/40 bg-[#FDFBF9] p-5 sm:p-6">
      {/* Header */}
      <ALCard animation="slide-up" className="flex items-start justify-between px-4 py-4 sm:px-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-wide text-[#1A3A52]">Live On-Duty Board</h1>
            <span className="flex items-center gap-1 rounded-full border border-blue-600 bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              Live
            </span>
          </div>
          <p className="mt-0.5 text-sm text-[#1A3A52]/70">
            Real-time shift assignments for the selected date.
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
      </ALCard>

      {/* Date picker */}
      <ALCard padding="sm" className="flex items-center gap-2">
        <label className="text-sm text-[#1A3A52]/70">Date:</label>
        <ALDatePicker
          value={businessDate}
          onChange={(val) => setBusinessDate(val)}
          placeholder="Select date"
          clearable
          inputSize="sm"
          wrapperClassName="w-38"
        />
        {["ALL", "ACTIVE", "CANCELLED"].map((code) => (
          <button
            key={code}
            onClick={() => setStatusFilter(code)}
            className={`rounded-full border px-3 py-1 font-medium transition-colors ${statusFilterClass(
              code,
              statusFilter === code
            )} ${
              statusFilter !== code ? "hover:text-slate-900" : ""
            }`}
          >
            {code.charAt(0) + code.slice(1).toLowerCase()}
          </button>
        ))}
      </ALCard>

      {/* Board table */}
      {isLoading ? (
        <ALCard className="flex items-center justify-center py-16 text-sm text-[#1A3A52]/70">
          Loading board…
        </ALCard>
      ) : filtered.length === 0 ? (
        <ALCard className="flex items-center justify-center py-16 text-sm text-[#1A3A52]/70">
          No assignments found for this date.
        </ALCard>
      ) : (
        <ALCard className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#D5BA98]/15">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-[#1A3A52]/80">Staff</th>
                <th className="px-4 py-3 text-left font-medium text-[#1A3A52]/80">Shift</th>
                <th className="px-4 py-3 text-left font-medium text-[#1A3A52]/80">Planned Time</th>
                <th className="px-4 py-3 text-left font-medium text-[#1A3A52]/80">Status</th>
                <th className="px-4 py-3 text-left font-medium text-[#1A3A52]/80">Assigned By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((r) => (
                <tr
                  key={r.shiftAssignmentId}
                  className="transition-colors hover:bg-[#D5BA98]/12"
                >
                  <td className="px-4 py-3 font-medium text-[#1A3A52]">{r.staffName}</td>
                  <td className="px-4 py-3 text-[#1A3A52]/70">{r.templateName ?? "—"}</td>
                  <td className="px-4 py-3 text-[#1A3A52]/70">
                    {fmt(r.plannedStartAt)} – {fmt(r.plannedEndAt)}
                  </td>
                  <td className="px-4 py-3">
                    <ShiftStatusBadge statusCode={r.isActive ? "active" : "cancelled"} type="assignment" />
                  </td>
                  <td className="px-4 py-3 text-[#1A3A52]/70">{r.assignedByName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ALCard>
      )}
    </div>
  );
}

void ShiftLiveTable_DEPRECATED;

export function ShiftLive() {
  const t = useTranslations("shift.live");
  const [businessDate, setBusinessDate] = useState(todayIso);
  const [filter, setFilter] = useState<LiveFilter>("ALL");

  const queryParams = useMemo(
    () => ({
      fromDate: businessDate,
      toDate: businessDate,
      isActive: true,
      pageSize: 200,
    }),
    [businessDate]
  );

  const { data, isLoading, isFetching, refetch, dataUpdatedAt } = useShiftLiveBoardQuery(queryParams);
  const { isRealtimeConnected } = useShiftLiveBoardRealtime(businessDate);
  const checkInMutation = useCheckInMutation();
  const checkOutMutation = useCheckOutMutation();

  const rows = useMemo(() => data ?? [], [data]);

  const sortedRows = useMemo(
    () =>
      [...rows].sort((left, right) => {
        const priorityDelta = sortPriority(left) - sortPriority(right);
        if (priorityDelta !== 0) return priorityDelta;

        const lateDelta = (right.lateMinutes ?? 0) - (left.lateMinutes ?? 0);
        if (lateDelta !== 0) return lateDelta;

        const startDelta = (left.plannedStartAt || "").localeCompare(right.plannedStartAt || "");
        if (startDelta !== 0) return startDelta;

        return left.staffName.localeCompare(right.staffName);
      }),
    [rows]
  );

  const filteredRows = useMemo(
    () => sortedRows.filter((row) => matchesFilter(row, filter)),
    [sortedRows, filter]
  );

  const summary = useMemo(
    () => ({
      urgent: rows.filter((row) => row.hasAlert || row.issueCount > 0).length,
      onDuty: rows.filter((row) => row.liveStatusCode === "ON_DUTY").length,
      waiting: rows.filter((row) => row.liveStatusCode === "WAITING").length,
      completed: rows.filter((row) => row.liveStatusCode === "COMPLETED").length,
    }),
    [rows]
  );

  const summaryCards = [
    {
      key: "urgent",
      label: t("summary.urgent"),
      value: summary.urgent,
      className: "border-red-200 bg-red-50 text-red-700",
    },
    {
      key: "on-duty",
      label: t("summary.onDuty"),
      value: summary.onDuty,
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    {
      key: "waiting",
      label: t("summary.waiting"),
      value: summary.waiting,
      className: "border-slate-200 bg-slate-50 text-slate-700",
    },
    {
      key: "completed",
      label: t("summary.completed"),
      value: summary.completed,
      className: "border-blue-200 bg-blue-50 text-blue-700",
    },
  ];

  const filterOptions: Array<{ key: LiveFilter; label: string }> = [
    { key: "ALL", label: t("filters.all") },
    { key: "URGENT", label: t("filters.urgent") },
    { key: "ON_DUTY", label: t("filters.onDuty") },
    { key: "WAITING", label: t("filters.waiting") },
    { key: "COMPLETED", label: t("filters.completed") },
  ];

  const lastUpdated = dataUpdatedAt
    ? dateUtils.formatLocal(new Date(dataUpdatedAt), "HH:mm:ss")
    : null;

  return (
    <div className="space-y-5 bg-[#FDFBF9]">
      <ALCard
        variant="soft"
        elevation="sm"
        animation="slide-up"
        className="rounded-xl border border-[#D5BA98]/60 px-4 py-4 sm:px-5"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-3xl font-semibold tracking-wide text-[#1A3A52]">
                {t("title")}
              </h1>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-600 bg-emerald-600 px-3 py-1 text-xs font-medium text-white">
                <span className="relative flex h-2.5 w-2.5">
                  <span className={cn(
                    "absolute inline-flex h-full w-full rounded-full bg-white/80",
                    isFetching ? "animate-ping" : "opacity-40"
                  )} />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
                </span>
                {isFetching ? t("updating") : t("live")}
              </span>
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
                  isRealtimeConnected
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-300 bg-slate-100 text-slate-700"
                )}
              >
                {isRealtimeConnected ? t("connection.realtime") : t("connection.polling")}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#1A3A52]/60">
              <span className="inline-flex items-center gap-1 rounded-full border border-[#D5BA98]/50 bg-white px-2.5 py-1">
                <TimerReset className="h-3.5 w-3.5" />
                {t("autoRefresh")}
              </span>
              {lastUpdated && <span className="rounded-full border border-[#D5BA98]/50 bg-white px-2.5 py-1">{t("lastUpdated", { time: lastUpdated })}</span>}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="border-[#D5BA98]/70 bg-white text-[#1A3A52] hover:bg-[#D5BA98]/15"
          >
            <RefreshCcw className={cn("h-4 w-4", isFetching && "animate-spin")} />
          </Button>
        </div>
      </ALCard>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <ALCard
          variant="default"
          elevation="sm"
          className="rounded-xl border border-[#D5BA98]/60 p-4 sm:p-5"
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <div
                key={card.key}
                className={cn(
                  "rounded-xl border px-4 py-3 shadow-sm transition-transform hover:-translate-y-0.5",
                  card.className
                )}
              >
                <p className="text-xs font-medium uppercase tracking-[0.2em]">{card.label}</p>
                <p className="mt-2 text-2xl font-semibold">{card.value}</p>
              </div>
            ))}
          </div>
        </ALCard>

        <ALCard
          variant="default"
          elevation="sm"
          className="rounded-xl border border-[#D5BA98]/60 p-4"
        >
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#1A3A52]/60">{t("businessDate")}</p>
              <div className="mt-2">
                <ALDatePicker
                  value={businessDate}
                  onChange={(value) => setBusinessDate(value || todayIso())}
                  placeholder={t("selectDate")}
                  inputSize="sm"
                />
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#1A3A52]/60">{t("quickFilters")}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {filterOptions.map((option) => {
                  const active = option.key === filter;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => setFilter(option.key)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        active
                          ? "border-[#1A3A52] bg-[#1A3A52] text-white"
                          : "border-[#D5BA98]/70 bg-[#FDFBF9] text-[#1A3A52] hover:bg-[#D5BA98]/15"
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </ALCard>
      </div>

      {isLoading ? (
        <ALCard className="flex items-center justify-center rounded-xl border border-[#D5BA98]/60 py-16 text-sm text-[#1A3A52]/70">
          {t("loading")}
        </ALCard>
      ) : filteredRows.length === 0 ? (
        <ALCard className="flex items-center justify-center rounded-xl border border-[#D5BA98]/60 py-16 text-sm text-[#1A3A52]/70">
          {t("empty")}
        </ALCard>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredRows.map((row) => {
            const tone = getVisualTone(row);
            const warning = getWarningLabel(row, t);
            const elapsedLabel = row.actualCheckOutAt
              ? fmtDuration(row.workedMinutes)
              : fmtDuration(getElapsedMinutes(row));

            return (
              <ALCard
                key={row.shiftAssignmentId}
                variant="default"
                elevation="sm"
                animation="fade"
                className={cn(
                  "overflow-hidden rounded-xl border border-l-4 p-0",
                  tone.cardClass,
                  tone.accentClass
                )}
              >
                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#D5BA98]/50 bg-[#D5BA98]/10 text-lg font-semibold text-[#1A3A52]">
                        {row.staffName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <p className="truncate text-base font-semibold text-[#1A3A52]">{row.staffName}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium",
                              getRoleBadgeClass(row.staffRoleCode, row.staffRoleName)
                            )}
                          >
                            {row.staffRoleName}
                          </span>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium",
                              tone.badgeClass
                            )}
                          >
                            {row.liveStatusName}
                          </span>
                        </div>
                      </div>
                    </div>

                    {(row.hasAlert || row.issueCount > 0) && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-red-600 bg-red-600 px-2.5 py-1 text-[11px] font-medium text-white">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/80" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                        </span>
                        {t("alert")}
                      </span>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-[#FDFBF9] p-3">
                      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#1A3A52]/55">
                        {t("sections.scheduledShift")}
                      </p>
                      <p className="mt-2 text-sm font-medium text-[#1A3A52]">
                        {fmt(row.plannedStartAt)} - {fmt(row.plannedEndAt)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-[#FDFBF9] p-3">
                      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#1A3A52]/55">
                        {t("sections.elapsedTime")}
                      </p>
                      <p className="mt-2 text-sm font-medium text-[#1A3A52]">{elapsedLabel}</p>
                    </div>
                  </div>

                  {warning ? (
                    <div className={cn("flex items-center gap-2 rounded-xl border px-3 py-2 text-sm", tone.mutedClass, row.hasAlert ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50")}>
                      {row.hasAlert ? <AlertTriangle className="h-4 w-4 shrink-0" /> : <Clock3 className="h-4 w-4 shrink-0" />}
                      <span>{warning}</span>
                    </div>
                  ) : null}

                  <div className="space-y-2 rounded-xl border border-[#D5BA98]/40 bg-white p-4">
                    <div className="flex items-start gap-2 text-sm text-[#1A3A52]">
                      <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-[#1A3A52]/60" />
                      <span>{getActivityLabel(row, t)}</span>
                    </div>

                    <div className="flex items-start gap-2 text-sm text-[#1A3A52]">
                      <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-[#1A3A52]/60" />
                      <span>{getPerformanceLabel(row, t)}</span>
                    </div>

                    {(row.latestIssueText || row.issueCount > 0) && (
                      <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {row.latestIssueText
                          ? row.latestIssueText
                          : t("issues.pending", { count: row.issueCount })}
                      </div>
                    )}
                  </div>

                  {(row.notes || row.isManualAdjustment) && (
                    <div className="rounded-xl border border-[#D5BA98]/40 bg-[#D5BA98]/10 px-3 py-2 text-sm text-[#1A3A52]/70">
                      {row.isManualAdjustment && <p>{t("manualAdjusted")}</p>}
                      {row.notes && <p>{row.notes}</p>}
                    </div>
                  )}

                  {/* Action buttons: Check-in / Check-out */}
                  {(row.liveStatusCode === "NOT_CHECKED_IN" || row.liveStatusCode === "ON_DUTY" || row.liveStatusCode === "WAITING") && (
                    <div className="flex items-center gap-2 border-t border-[#D5BA98]/30 pt-4">
                      {row.liveStatusCode === "NOT_CHECKED_IN" && (
                        <PermissionGuard permission={Permissions.CheckInShift}>
                          <Button
                            size="sm"
                            onClick={() => checkInMutation.mutate(row.shiftAssignmentId)}
                            disabled={checkInMutation.isPending}
                            className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            <LogIn className="h-3.5 w-3.5" />
                            {t("actions.checkIn")}
                          </Button>
                        </PermissionGuard>
                      )}
                      {(row.liveStatusCode === "ON_DUTY" || row.liveStatusCode === "WAITING") && (
                        <PermissionGuard permission={Permissions.CheckOutShift}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => checkOutMutation.mutate(row.shiftAssignmentId)}
                            disabled={checkOutMutation.isPending}
                            className="gap-1.5 border-red-300 text-red-700 hover:bg-red-50"
                          >
                            <LogOut className="h-3.5 w-3.5" />
                            {t("actions.checkOut")}
                          </Button>
                        </PermissionGuard>
                      )}
                    </div>
                  )}
                </div>
              </ALCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
