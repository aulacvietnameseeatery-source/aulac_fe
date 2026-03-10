"use client";

import React, { useMemo } from "react";
import Link from "next/link";
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

const StatusBar: React.FC<{ segments: StatusSegment[]; total: number }> = ({
  segments,
  total,
}) => (
  <div className="space-y-2">
    {/* Bar */}
    <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
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
          <span className="text-[11px] text-gray-500">
            {s.label}{" "}
            <span className="font-semibold text-gray-700">{s.count}</span>
          </span>
        </div>
      ))}
      {total > 0 && (
        <span className="ml-auto text-[11px] text-gray-400">{total} total</span>
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
}> = ({ icon, label, value, sub, accent = "text-gray-800" }) => (
  <div className="flex items-start gap-3 rounded-lg bg-gray-50/80 px-3.5 py-3 min-w-0">
    <div className="mt-0.5 shrink-0 text-gray-400">{icon}</div>
    <div className="min-w-0">
      <p className="text-[11px] text-gray-400 uppercase tracking-wide leading-none mb-1">
        {label}
      </p>
      <p className={cn("text-lg font-bold leading-none", accent)}>{value}</p>
      {sub && (
        <p className="text-[10px] text-gray-400 mt-1 truncate">{sub}</p>
      )}
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
  const isConfirmed = r.status === "CONFIRMED";
  return (
    <div className="flex flex-col justify-between shrink-0 w-44 rounded-lg border border-gray-100 bg-white p-3 hover:bg-gray-50/60 transition-colors">
      {/* Time + status row */}
      <div className="flex items-start justify-between gap-1 mb-2">
        <div
          className={cn(
            "flex flex-col items-center rounded-md px-2 py-1.5",
            isConfirmed
              ? "bg-amber-50 text-amber-700"
              : "bg-gray-50 text-gray-500"
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
              ? "bg-emerald-50 text-emerald-700"
              : "bg-gray-100 text-gray-500"
          )}
        >
          {isConfirmed ? "Confirmed" : "Pending"}
        </span>
      </div>

      {/* Guest */}
      <div className="flex items-center gap-1.5 mb-1">
        <User size={12} className="text-gray-400 shrink-0" />
        <p className="text-xs font-semibold text-gray-700 truncate">
          {r.guestName}
        </p>
      </div>

      {/* Pax + Table */}
      <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-1">
        <span>{r.pax} pax</span>
        <span>·</span>
        <MapPin size={10} className="shrink-0" />
        <span className="truncate">
          {r.tableCode} · {r.zoneName}
        </span>
      </div>

      {/* Pre-order */}
      {r.preOrderSummary && (
        <p className="text-[10px] text-blue-500 truncate mt-auto">
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
    <Card className="py-0 gap-0">
      <CardContent className="p-5 space-y-4">
        {/* Title row */}
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-800">Overview</h4>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">
              {total} tables &middot; {stats.totalCapacity} seats
            </span>
            <button
              type="button"
              onClick={handleToggle}
              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={isCollapsed ? "Expand overview" : "Collapse overview"}
            >
              {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
          </div>
        </div>

        {/* Collapsible body */}
        {!isCollapsed && (
          <>
            {/* Compact status bar */}
            <StatusBar segments={statusSegments} total={total} />

            {/* KPI Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                icon={<Users size={16} />}
                label="Total Capacity"
                value={stats.totalCapacity}
                sub={`Avg ${total > 0 ? Math.round(stats.totalCapacity / total) : 0} seats/table`}
              />
              <StatCard
                icon={<Wifi size={16} />}
                label="Online"
                value={
                  <span className="flex items-baseline gap-1.5">
                    {stats.online}
                    {stats.offline > 0 && (
                      <span className="text-xs font-normal text-gray-400 flex items-center gap-0.5">
                        <WifiOff size={10} /> {stats.offline}
                      </span>
                    )}
                  </span>
                }
                accent="text-emerald-700"
              />
              <StatCard
                icon={<ShoppingBag size={16} />}
                label="Active Orders"
                value={stats.activeOrders}
                accent={stats.activeOrders > 0 ? "text-blue-700" : "text-gray-800"}
              />
              <StatCard
                icon={<AlertTriangle size={16} />}
                label="Errors"
                value={stats.withErrors}
                accent={stats.withErrors > 0 ? "text-orange-600" : "text-gray-800"}
                sub={stats.withErrors > 0 ? "Needs attention" : "All clear"}
              />
            </div>

            {/* Incoming Reservations */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <CalendarClock size={13} />
                  Incoming Reservations
                  <span className="text-[11px] font-normal normal-case tracking-normal text-gray-400">
                    ({MOCK_RESERVATIONS.length})
                  </span>
                </h5>
                <Link
                  href="/dashboard/reservation"
                  className="text-xs text-blue-600 underline underline-offset-2 hover:text-blue-800 transition-colors"
                >
                  See all
                </Link>
              </div>

              {MOCK_RESERVATIONS.length === 0 ? (
                <p className="text-xs text-gray-400 py-3 text-center">
                  No upcoming reservations
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
