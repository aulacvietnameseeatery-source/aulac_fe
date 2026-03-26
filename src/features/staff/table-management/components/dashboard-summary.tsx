"use client";

import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/routing"
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Wifi,
  WifiOff,
  ShoppingBag,
  AlertTriangle,
  CalendarClock,
  MapPin,
  User,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { RestaurantTable, TableStatus } from "../types";
import { TABLE_STATUS_CONFIG } from "../types";

/* ─── Props ──────────────────────────────────────────────── */

interface DashboardSummaryProps {
  tables: RestaurantTable[];
}

/* ─── Compact Status Bar (horizontal) ────────────────────── */

interface StatusSegment {
  status: TableStatus;
  count: number;
  pct: number;
  color: string;
  label: string;
}

const StatusBar: React.FC<{ segments: StatusSegment[]; total: number; t: ReturnType<typeof useTranslations> }> = ({
  segments,
  total,
  t,
}) => (
  <div className="space-y-2">
    {/* Bar */}
    <div className="flex h-2 overflow-hidden rounded-full bg-[#D5BA98]/25">
      {segments
        .filter((s) => s.count > 0)
        .map((s) => (
          <div
            key={s.status}
            className={cn("h-full transition-all duration-500", s.color)}
            style={{ width: `${s.pct}%` }}
            data-tooltip-content={`${s.label}: ${s.count}`}
            data-tooltip-id="my-tooltip"
          />
        ))}
    </div>
    {/* Inline legend */}
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {segments.map((s) => (
        <div key={s.status} className="flex items-center gap-1.5">
          <span className={cn("w-2 h-2 rounded-full shrink-0", s.color)} />
          <span className="text-[11px] text-[#1A3A52]/70">
            {s.label}{" "}
            <span className="font-semibold text-[#1A3A52]">{s.count}</span>
          </span>
        </div>
      ))}
      {total > 0 && (
        <span className="ml-auto text-[11px] text-[#1A3A52]/55">{t("dashboard.totalCount", { count: total })}</span>
      )}
    </div>
  </div>
);

/* ─── Stat Card (small KPI) ──────────────────────────────── */

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: string;
  accent?: string;
}> = ({ icon, label, value, sub, accent = "text-[#1A3A52]" }) => (
  <div className="min-w-0 rounded-lg border border border-[#D5BA98]/60 bg-white px-3.5 py-3 shadow-sm">
    <div className="flex items-start gap-3">
    <div className="mt-0.5 shrink-0 text-[#1A3A52]/60">{icon}</div>
    <div className="min-w-0">
      <p className="mb-1 text-[11px] uppercase leading-none tracking-wide text-[#1A3A52]/60">
        {label}
      </p>
      <p className={cn("text-lg font-bold leading-none", accent)}>{value}</p>
      {sub && (
        <p className="mt-1 truncate text-[10px] text-[#1A3A52]/60">{sub}</p>
      )}
    </div>
    </div>
  </div>
);

/* ─── Mock Incoming Reservations ─────────────────────────── */

interface IncomingReservation {
  reservationId: number;
  guestName: string;
  pax: number;
  reservedTime: string; // ISO string
  tableCode: string;
  zoneName: string;
  status: "PENDING" | "CONFIRMED";
  preOrderSummary?: string;
}

const MOCK_RESERVATIONS: IncomingReservation[] = [
  {
    reservationId: 101,
    guestName: "Nguyen Van A",
    pax: 4,
    reservedTime: new Date(Date.now() + 25 * 60_000).toISOString(),
    tableCode: "T-03",
    zoneName: "Indoor",
    status: "CONFIRMED",
    preOrderSummary: "2× Pho, 1× Spring Roll",
  },
  {
    reservationId: 102,
    guestName: "Tran Thi B",
    pax: 6,
    reservedTime: new Date(Date.now() + 55 * 60_000).toISOString(),
    tableCode: "T-12",
    zoneName: "Outdoor",
    status: "CONFIRMED",
  },
  {
    reservationId: 103,
    guestName: "Le Minh C",
    pax: 8,
    reservedTime: new Date(Date.now() + 90 * 60_000).toISOString(),
    tableCode: "V-01",
    zoneName: "Rooftop",
    status: "PENDING",
    preOrderSummary: "3× Wagyu Set",
  },
  {
    reservationId: 104,
    guestName: "Pham D",
    pax: 2,
    reservedTime: new Date(Date.now() + 130 * 60_000).toISOString(),
    tableCode: "P-01",
    zoneName: "Indoor",
    status: "PENDING",
  },
];

function formatTimeUntil(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "Now";
  const mins = Math.round(diff / 60_000);
  if (mins < 60) return `in ${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `in ${hrs}h ${rem}m` : `in ${hrs}h`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ReservationCard: React.FC<{ r: IncomingReservation }> = ({ r }) => {
  const t = useTranslations("tableManagement");
  const isConfirmed = r.status === "CONFIRMED";
  return (
    <div className="flex w-44 shrink-0 flex-col justify-between rounded-lg border border border-[#D5BA98]/60 bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      {/* Time + status row */}
      <div className="flex items-start justify-between gap-1 mb-2">
        <div
          className={cn(
            "flex flex-col items-center rounded-md px-2 py-1.5",
            isConfirmed
              ? "bg-[#D5BA98]/35 text-[#1A3A52]"
              : "bg-[#D5BA98]/15 text-[#1A3A52]/70"
          )}
        >
          <span className="text-xs font-bold leading-none">
            {formatTime(r.reservedTime)}
          </span>
          <span className="text-[10px] mt-0.5 leading-none">
            {formatTimeUntil(r.reservedTime)}
          </span>
        </div>
        <span
          className={cn(
            "text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap",
            isConfirmed
              ? "bg-[#4A5D4E]/15 text-[#4A5D4E]"
              : "bg-[#D5BA98]/20 text-[#1A3A52]/70"
          )}
        >
          {isConfirmed ? t("status.confirmed") : t("status.pending")}
        </span>
      </div>

      {/* Guest */}
      <div className="flex items-center gap-1.5 mb-1">
        <User size={12} className="shrink-0 text-[#1A3A52]/50" />
        <p className="truncate text-xs font-semibold text-[#1A3A52]">
          {r.guestName}
        </p>
      </div>

      {/* Pax + Table */}
      <div className="mb-1 flex items-center gap-1 text-[10px] text-[#1A3A52]/55">
        <span>{t("detail.paxCount", { count: r.pax })}</span>
        <span>·</span>
        <MapPin size={10} className="shrink-0" />
        <span className="truncate">
          {r.tableCode} · {r.zoneName}
        </span>
      </div>

      {/* Pre-order */}
      {r.preOrderSummary && (
        <p className="mt-auto truncate text-[10px] text-[#1A3A52]/75">
          🍽 {r.preOrderSummary}
        </p>
      )}
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────── */

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({
  tables,
}) => {
  const t = useTranslations("tableManagement");
  const total = tables.length;

  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("au-lac-dashboard-collapsed") === "true";
  });

  const handleToggle = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("au-lac-dashboard-collapsed", String(next));
      return next;
    });
  };

  /* Status segments */
  const statusSegments = useMemo<StatusSegment[]>(() => {
    const counts: Record<TableStatus, number> = {
      AVAILABLE: 0,
      OCCUPIED: 0,
      RESERVED: 0,
      LOCKED: 0,
    };
    tables.forEach((t) => counts[t.status]++);

    return (Object.keys(counts) as TableStatus[]).map((status) => ({
      status,
      count: counts[status],
      pct: total > 0 ? (counts[status] / total) * 100 : 0,
      color: TABLE_STATUS_CONFIG[status].dotColor,
      label: TABLE_STATUS_CONFIG[status].label,
    }));
  }, [tables, total]);

  /* Aggregated stats */
  const stats = useMemo(() => {
    const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);
    const online = tables.filter((t) => t.isOnline).length;
    const offline = total - online;
    const activeOrders = tables.reduce((sum, t) => sum + t.activeOrders, 0);
    const withErrors = tables.filter((t) => t.hasErrors).length;

    return {
      totalCapacity,
      online,
      offline,
      activeOrders,
      withErrors,
    };
  }, [tables, total]);

  return (
    <Card className="gap-0 border-[#D5BA98]/50 bg-[#FDFBF9] py-0 shadow-none">
      <CardContent className="p-5 space-y-4">
        {/* Title row */}
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-[#1A3A52]">{t("dashboard.overview")}</h4>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#1A3A52]/60">
              {t("dashboard.tablesAndSeats", { tables: total, seats: stats.totalCapacity })}
            </span>
            <button
              type="button"
              onClick={handleToggle}
              className="rounded p-1 text-[#1A3A52]/55 transition-colors hover:bg-[#D5BA98]/25 hover:text-[#1A3A52]"
              aria-label={isCollapsed ? t("dashboard.expandOverview") : t("dashboard.collapseOverview")}
            >
              {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
          </div>
        </div>

        {/* Collapsible body */}
        {!isCollapsed && (
          <>
            {/* Compact status bar */}
            <StatusBar segments={statusSegments} total={total} t={t} />

            {/* KPI Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                icon={<Users size={16} />}
                label={t("dashboard.totalCapacity")}
                value={stats.totalCapacity}
                sub={t("dashboard.avgSeatsPerTable", { count: total > 0 ? Math.round(stats.totalCapacity / total) : 0 })}
              />
              <StatCard
                icon={<Wifi size={16} />}
                label={t("filters.online")}
                value={
                  <span className="flex items-baseline gap-1.5">
                    {stats.online}
                    {stats.offline > 0 && (
                      <span className="flex items-center gap-0.5 text-xs font-normal text-[#1A3A52]/55">
                        <WifiOff size={10} /> {stats.offline}
                      </span>
                    )}
                  </span>
                }
                accent="text-[#4A5D4E]"
              />
              <StatCard
                icon={<ShoppingBag size={16} />}
                label={t("detail.activeOrders")}
                value={stats.activeOrders}
                accent={stats.activeOrders > 0 ? "text-[#1A3A52]" : "text-[#1A3A52]"}
              />
              <StatCard
                icon={<AlertTriangle size={16} />}
                label={t("detail.errors")}
                value={stats.withErrors}
                accent={stats.withErrors > 0 ? "text-[#8C3A3A]" : "text-[#1A3A52]"}
                sub={stats.withErrors > 0 ? t("dashboard.needsAttention") : t("dashboard.allClear")}
              />
            </div>

            {/* Incoming Reservations */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#1A3A52]/60">
                  <CalendarClock size={13} />
                  {t("dashboard.incomingReservations")}
                  <span className="text-[11px] font-normal normal-case tracking-normal text-[#1A3A52]/55">
                    ({MOCK_RESERVATIONS.length})
                  </span>
                </h5>
                <Link
                  href="/dashboard/reservation"
                  className="text-xs text-[#1A3A52] underline underline-offset-2 transition-colors hover:text-[#1A3A52]/75"
                >
                  {t("dashboard.seeAll")}
                </Link>
              </div>

              {MOCK_RESERVATIONS.length === 0 ? (
                <p className="py-3 text-center text-xs text-[#1A3A52]/55">
                  {t("dashboard.noUpcomingReservations")}
                </p>
              ) : (
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                  {MOCK_RESERVATIONS.map((r) => (
                    <ReservationCard key={r.reservationId} r={r} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardSummary;
