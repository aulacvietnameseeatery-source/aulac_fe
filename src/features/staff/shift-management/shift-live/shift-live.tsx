"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  ChefHat,
  CircleDollarSign,
  Clock3,
  Flame,
  RefreshCcw,
  TableProperties,
  TimerReset,
  UserRound,
  Wallet,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ALDatePicker } from "@/components/ui/al-date-picker";
import { ALCard } from "@/components/ui/al-card";
import { formatCHF } from "@/lib/format-chf-utils";
import { cn } from "@/lib/utils";
import { Link } from "@/routing";
import {
  useShiftAssignmentsQuery,
  useShiftLiveBoardQuery,
  useShiftLiveOperationsQuery,
} from "../hooks/use-shift-queries";
import { useShiftLiveBoardRealtime } from "../hooks/use-shift-live-board-realtime";
import { ShiftStatusBadge } from "../components/shift-status-badge";
import { dateUtils } from "@/lib/date-utils";
import type {
  ShiftAssignmentListDto,
  ShiftLiveBoardItemDto,
  ShiftLiveOperationsSnapshotDto,
  ShiftLiveTopSellingItemDto,
} from "../types/shift-management.types";

// ── helpers ──

type LiveFilter = "ALL" | "URGENT" | "ON_DUTY" | "WAITING" | "COMPLETED";
type TranslateFn = (key: string, values?: Record<string, string | number>) => string;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

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
  return formatCHF(value);
}

function fmtSignedCurrency(value: number) {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${fmtCurrency(Math.abs(value), "0")}`;
}

function fmtSignedNumber(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("en-US", {
    signDisplay: "exceptZero",
    maximumFractionDigits,
    minimumFractionDigits: maximumFractionDigits > 0 ? 1 : 0,
  }).format(value);
}

function fmtPercent(value: number, maximumFractionDigits = 1) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
    minimumFractionDigits: value % 1 === 0 ? 0 : Math.min(maximumFractionDigits, 1),
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

function createEmptyLiveOperationsSnapshot(businessDate: string): ShiftLiveOperationsSnapshotDto {
  return {
    businessDate,
    snapshotAt: new Date().toISOString(),
    tables: {
      occupiedTables: 0,
      occupiedTablesDelta: 0,
      totalTables: 0,
      occupancyRate: 0,
      occupancyRateDelta: 0,
      waitingQueueCount: 0,
      waitingQueueDelta: 0,
      averageTurnoverMinutes: null,
      averageTurnoverDeltaMinutes: null,
    },
    orders: {
      pendingCount: 0,
      cookingCount: 0,
      readyCount: 0,
      servedCount: 0,
      activeCount: 0,
      activeCountDelta: 0,
      servedCountDelta: 0,
    },
    revenue: {
      revenue: 0,
      revenueDelta: 0,
      revenueDeltaPercent: 0,
      closedBills: 0,
      closedBillsDelta: 0,
      averageBill: 0,
    },
    topSelling: {
      totalQuantity: 0,
      totalQuantityDelta: 0,
      items: [],
    },
  };
}

function getComparisonLabel(isTodaySelected: boolean, t: TranslateFn) {
  return isTodaySelected
    ? t("operations.shared.vsYesterdaySameTime")
    : t("operations.shared.vsPreviousDay");
}

function getStockBadge(item: ShiftLiveTopSellingItemDto, t: TranslateFn) {
  if (item.stockStatusCode === "OUT") {
    return {
      label: t("operations.topSelling.stockOut"),
      className: "border-red-200 bg-red-50 text-red-700",
    };
  }

  if (item.stockStatusCode === "UNKNOWN" || item.estimatedPortionsLeft == null) {
    return {
      label: t("operations.topSelling.stockUnknown"),
      className: "border-slate-200 bg-slate-50 text-slate-700",
    };
  }

  if (item.stockStatusCode === "LOW") {
    return {
      label: t("operations.topSelling.stockLeft", { count: item.estimatedPortionsLeft }),
      className: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return {
    label: t("operations.topSelling.stockLeft", { count: item.estimatedPortionsLeft }),
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };
}

function DeltaBadge({
  delta,
  label,
  className,
}: {
  delta: number;
  label: string;
  className?: string;
}) {
  const isPositive = delta > 0;
  const isNegative = delta < 0;
  const Icon = isPositive ? ArrowUpRight : isNegative ? ArrowDownRight : ArrowRight;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium",
        isPositive && "border-emerald-200 bg-emerald-50 text-emerald-700",
        isNegative && "border-red-200 bg-red-50 text-red-700",
        !isPositive && !isNegative && "border-slate-200 bg-slate-50 text-slate-700",
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </span>
  );
}

function LiveSummaryCardSkeleton() {
  return (
    <ALCard
      variant="default"
      elevation="sm"
      className="rounded-xl border border-[#D5BA98]/60 p-4 sm:p-5"
    >
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-36 rounded bg-[#D5BA98]/30" />
        <div className="h-9 w-40 rounded bg-[#D5BA98]/20" />
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="h-14 rounded-xl bg-[#D5BA98]/15" />
          <div className="h-14 rounded-xl bg-[#D5BA98]/15" />
        </div>
        <div className="h-4 w-28 rounded bg-[#D5BA98]/20" />
      </div>
    </ALCard>
  );
}

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

  const liveOperationsParams = useMemo(
    () => ({ businessDate }),
    [businessDate],
  );

  const {
    data,
    isLoading,
    isFetching,
    refetch: refetchBoard,
    dataUpdatedAt,
  } = useShiftLiveBoardQuery(queryParams);
  const {
    data: liveOperationsData,
    isLoading: isLiveOperationsLoading,
    isFetching: isLiveOperationsFetching,
    refetch: refetchLiveOperations,
    dataUpdatedAt: liveOperationsUpdatedAt,
  } = useShiftLiveOperationsQuery(liveOperationsParams);
  const { isRealtimeConnected } = useShiftLiveBoardRealtime(businessDate);

  const rows = useMemo(() => data ?? [], [data]);
  const liveOperations = liveOperationsData ?? createEmptyLiveOperationsSnapshot(businessDate);
  const isTodaySelected = businessDate === todayIso();
  const comparisonLabel = getComparisonLabel(isTodaySelected, t);

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

  const mergedUpdatedAt = Math.max(dataUpdatedAt || 0, liveOperationsUpdatedAt || 0);
  const lastUpdated = mergedUpdatedAt
    ? dateUtils.formatLocal(new Date(mergedUpdatedAt), "HH:mm:ss")
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
            onClick={() => {
              void Promise.allSettled([refetchBoard(), refetchLiveOperations()]);
            }}
            disabled={isLoading || isFetching || isLiveOperationsLoading || isLiveOperationsFetching}
            className="border-[#D5BA98]/70 bg-white text-[#1A3A52] hover:bg-[#D5BA98]/15"
          >
            <RefreshCcw className={cn("h-4 w-4", (isFetching || isLiveOperationsFetching) && "animate-spin")} />
          </Button>
        </div>
      </ALCard>

      {isLiveOperationsLoading && !liveOperationsData ? (
        <div className="grid items-start gap-3 xl:grid-cols-2 2xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <LiveSummaryCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className="grid items-start gap-3 xl:grid-cols-2 2xl:grid-cols-4">
          <ALCard
            as="article"
            variant="default"
            elevation="sm"
            animation="fade"
            className="rounded-xl border border-[#D5BA98]/60 p-4 text-left"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[#1A3A52]">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#D5BA98]/50 bg-[#D5BA98]/12 text-[#1A3A52]">
                      <TableProperties className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold leading-snug text-[#1A3A52]">{t("operations.tables.title")}</p>
                      <p className="text-xs text-[#1A3A52]/60">{t("operations.tables.subtitle")}</p>
                    </div>
                  </div>
                </div>
                <DeltaBadge
                  delta={liveOperations.tables.occupiedTablesDelta}
                  label={`${fmtSignedNumber(liveOperations.tables.occupiedTablesDelta)} ${comparisonLabel}`}
                />
              </div>

              <div>
                <p className="text-[2rem] font-semibold leading-tight text-[#1A3A52]">
                  {t("operations.tables.occupied", {
                    occupied: liveOperations.tables.occupiedTables,
                    total: liveOperations.tables.totalTables,
                  })}
                </p>
                <p className="mt-1 text-sm text-[#1A3A52]/65">
                  {t("operations.tables.occupancyRate", {
                    rate: fmtPercent(liveOperations.tables.occupancyRate),
                  })}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-[#FDFBF9] p-2.5">
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#1A3A52]/55">
                    {t("operations.tables.turnover")}
                  </p>
                  <p className="mt-2 text-sm font-medium text-[#1A3A52]">
                    {liveOperations.tables.averageTurnoverMinutes != null
                      ? t("operations.tables.turnoverValue", {
                          minutes: liveOperations.tables.averageTurnoverMinutes,
                        })
                      : t("operations.tables.noTurnover")}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-[#FDFBF9] p-2.5">
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#1A3A52]/55">
                    {t("operations.tables.queue")}
                  </p>
                  <p className="mt-2 text-sm font-medium text-[#1A3A52]">
                    {t("operations.tables.queueValue", {
                      count: liveOperations.tables.waitingQueueCount,
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1 text-sm text-[#1A3A52]/70">
                <span>
                  {fmtSignedNumber(liveOperations.tables.occupancyRateDelta, 1)}pp • {fmtSignedNumber(liveOperations.tables.waitingQueueDelta)}
                </span>
                <Link
                  href="/dashboard/tables"
                  className="inline-flex shrink-0 items-center gap-1 font-medium text-[#1A3A52] underline-offset-4 transition hover:underline"
                >
                  {t("operations.shared.openDetail")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </ALCard>

          <ALCard
            as="article"
            variant="default"
            elevation="sm"
            animation="fade"
            className="rounded-xl border border-amber-200 p-4 text-left"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-[#1A3A52]">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700">
                    <ChefHat className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold leading-snug text-[#1A3A52]">{t("operations.orders.title")}</p>
                    <p className="text-xs text-[#1A3A52]/60">{t("operations.orders.subtitle")}</p>
                  </div>
                </div>
                <DeltaBadge
                  delta={liveOperations.orders.activeCountDelta}
                  label={`${fmtSignedNumber(liveOperations.orders.activeCountDelta)} ${comparisonLabel}`}
                  className="border-amber-200 bg-amber-50 text-amber-700"
                />
              </div>

              <div>
                <p className="text-[2rem] font-semibold leading-tight text-[#1A3A52]">
                  {t("operations.orders.liveTickets", { count: liveOperations.orders.activeCount })}
                </p>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { key: "pending", value: liveOperations.orders.pendingCount },
                  { key: "cooking", value: liveOperations.orders.cookingCount },
                  { key: "ready", value: liveOperations.orders.readyCount },
                  { key: "served", value: liveOperations.orders.servedCount },
                ].map((stage) => (
                  <div key={stage.key} className="rounded-xl border border-slate-200 bg-[#FDFBF9] px-2.5 py-2.5 text-center">
                    <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#1A3A52]/55">
                      {t(`operations.orders.${stage.key}`)}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[#1A3A52]">{stage.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-3 pt-1 text-sm text-[#1A3A52]/70">
                <span>
                  {fmtSignedNumber(liveOperations.orders.servedCountDelta)} {t("operations.orders.servedDelta")}
                </span>
                <Link
                  href="/dashboard/kitchen"
                  className="inline-flex shrink-0 items-center gap-1 font-medium text-[#1A3A52] underline-offset-4 transition hover:underline"
                >
                  {t("operations.shared.openDetail")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </ALCard>

          <ALCard
            as="article"
            variant="default"
            elevation="sm"
            animation="fade"
            className="rounded-xl border border-emerald-200 p-4 text-left"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-[#1A3A52]">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700">
                    <CircleDollarSign className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold leading-snug text-[#1A3A52]">{t("operations.revenue.title")}</p>
                    <p className="text-xs text-[#1A3A52]/60">{t("operations.revenue.subtitle")}</p>
                  </div>
                </div>
                <DeltaBadge
                  delta={liveOperations.revenue.revenueDelta}
                  label={`${fmtSignedCurrency(liveOperations.revenue.revenueDelta)} ${comparisonLabel}`}
                />
              </div>

              <div>
                <p className="text-[2rem] font-semibold leading-tight text-[#1A3A52]">
                  {fmtCurrency(liveOperations.revenue.revenue, "0")}
                </p>
                <p className="mt-1 text-sm text-[#1A3A52]/65">
                  {fmtSignedNumber(liveOperations.revenue.revenueDeltaPercent, 1)}% • {t("operations.revenue.deltaPercent")}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-[#FDFBF9] p-2.5">
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#1A3A52]/55">
                    {t("operations.revenue.closedBills")}
                  </p>
                  <p className="mt-2 text-sm font-medium text-[#1A3A52]">{liveOperations.revenue.closedBills}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-[#FDFBF9] p-2.5">
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#1A3A52]/55">
                    {t("operations.revenue.averageBill")}
                  </p>
                  <p className="mt-2 text-sm font-medium text-[#1A3A52]">
                    {fmtCurrency(liveOperations.revenue.averageBill, "0")}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1 text-sm text-[#1A3A52]/70">
                <span>
                  {fmtSignedNumber(liveOperations.revenue.closedBillsDelta)} {t("operations.revenue.billsDelta")}
                </span>
                <Link
                  href="/dashboard/payments"
                  className="inline-flex shrink-0 items-center gap-1 font-medium text-[#1A3A52] underline-offset-4 transition hover:underline"
                >
                  {t("operations.shared.openDetail")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </ALCard>

          <ALCard
            as="article"
            variant="default"
            elevation="sm"
            animation="fade"
            className="rounded-xl border border-orange-200 p-4 text-left"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-[#1A3A52]">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-orange-200 bg-orange-50 text-orange-700">
                    <Flame className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold leading-snug text-[#1A3A52]">{t("operations.topSelling.title")}</p>
                    <p className="text-xs text-[#1A3A52]/60">{t("operations.topSelling.subtitle")}</p>
                  </div>
                </div>
                <DeltaBadge
                  delta={liveOperations.topSelling.totalQuantityDelta}
                  label={`${fmtSignedNumber(liveOperations.topSelling.totalQuantityDelta)} ${comparisonLabel}`}
                />
              </div>

              {liveOperations.topSelling.items.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-[#D5BA98]/60 bg-[#FDFBF9] px-4 py-6 text-sm text-[#1A3A52]/65">
                  {t("operations.topSelling.empty")}
                </div>
              ) : (
                <div className="space-y-2">
                  {liveOperations.topSelling.items.map((item, index) => {
                    const stockBadge = getStockBadge(item, t);
                    return (
                      <div
                        key={item.dishId}
                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-[#FDFBF9] px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[#1A3A52]">
                            {index + 1}. {item.dishName}
                          </p>
                          <p className="mt-1 text-xs text-[#1A3A52]/60">
                            {t("operations.topSelling.sold", { count: item.quantitySold })}
                            <span className="ml-2">{fmtSignedNumber(item.quantityDelta)}</span>
                          </p>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium",
                            stockBadge.className,
                          )}
                        >
                          {stockBadge.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-1 text-sm text-[#1A3A52]/70">
                <span>{t("operations.topSelling.totalSold", { count: liveOperations.topSelling.totalQuantity })}</span>
                <Link
                  href="/dashboard/reports/sales"
                  className="inline-flex shrink-0 items-center gap-1 font-medium text-[#1A3A52] underline-offset-4 transition hover:underline"
                >
                  {t("operations.shared.openDetail")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </ALCard>
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_340px]">
        <ALCard
          variant="default"
          elevation="sm"
          className="rounded-xl border border-[#D5BA98]/60 p-3 sm:p-4"
        >
          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <div
                key={card.key}
                className={cn(
                  "rounded-lg border px-3 py-2.5 shadow-sm",
                  card.className
                )}
              >
                <p className="text-xs font-medium uppercase tracking-[0.2em]">{card.label}</p>
                <p className="mt-1 text-lg font-semibold">{card.value}</p>
              </div>
            ))}
          </div>
        </ALCard>

        <ALCard
          variant="default"
          elevation="sm"
          className="rounded-xl border border-[#D5BA98]/60 p-3 sm:p-4"
        >
          <div className="space-y-2.5">
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
                </div>
              </ALCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
