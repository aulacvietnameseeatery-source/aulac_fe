"use client";

import { useMemo } from "react";
import { RefreshCcw, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMyShiftsQuery } from "../hooks/use-shift-queries";
import { CheckInCard } from "../components/check-in-card";
import { ShiftStatusBadge } from "../components/shift-status-badge";
import type { ShiftAssignmentDto } from "../types/shift-management.types";

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

// ── sub-components ──

function ShiftRow({ a }: { a: ShiftAssignmentDto }) {
  const att = a.attendance;
  const statusCode = att?.attendanceStatusCode ?? "SCHEDULED";

  return (
    <div className="flex items-center justify-between rounded-lg border border-[#D5BA98]/60 bg-[#FDFBF9] px-4 py-3 transition-colors hover:bg-[#D5BA98]/15">
      <div className="space-y-0.5 min-w-0">
        <p className="truncate text-sm font-medium text-[#1A3A52]">{a.shiftTypeName ?? `Schedule #${a.shiftScheduleId}`}</p>
        <p className="text-xs text-[#1A3A52]/70">
          {a.businessDate} · {fmt(a.plannedStartAt)} – {fmt(a.plannedEndAt)}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-3">
        {att && att.lateMinutes > 0 && (
          <Badge variant="destructive" className="text-xs">
            +{att.lateMinutes}min late
          </Badge>
        )}
        <ShiftStatusBadge statusCode={statusCode} type="attendance" />
      </div>
    </div>
  );
}

// ── main component ──

export function MyShifts() {
  const today = todayIso();

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
  const all = data?.pageData ?? [];

  // Partition: today / upcoming / past
  const todayShifts = useMemo(
    () => all.filter((a) => a.businessDate === today),
    [all, today]
  );

  const upcoming = useMemo(
    () =>
      all
        .filter((a) => a.businessDate && a.businessDate > today)
        .sort((a, b) => (a.businessDate ?? "").localeCompare(b.businessDate ?? "")),
    [all, today]
  );

  const past = useMemo(
    () =>
      all
        .filter((a) => a.businessDate && a.businessDate < today)
        .sort((a, b) => (b.businessDate ?? "").localeCompare(a.businessDate ?? "")),
    [all, today]
  );

  return (
    <div className="space-y-6 rounded-2xl border border-[#D5BA98]/40 bg-linear-to-b from-[#FDFBF9] via-[#D5BA98]/10 to-[#FDFBF9] p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-wide text-[#1A3A52]">My Shifts</h1>
          <p className="text-sm text-[#1A3A52]/70">
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
        <div className="flex items-center justify-center py-20 text-sm text-[#1A3A52]/70">
          Loading shifts…
        </div>
      ) : all.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-[#1A3A52]/70">
          <CalendarDays className="w-10 h-10" />
          <p className="text-sm">No shifts assigned in the next 30 days.</p>
        </div>
      ) : (
        <>
          {/* Today */}
          {todayShifts.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-base font-semibold text-[#1A3A52]">Today</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {todayShifts.map((a) => (
                  <CheckInCard key={a.shiftAssignmentId} assignment={a} />
                ))}
              </div>
            </section>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-base font-semibold text-[#1A3A52]">Upcoming</h2>
              <div className="space-y-2">
                {upcoming.map((a) => (
                  <ShiftRow key={a.shiftAssignmentId} a={a} />
                ))}
              </div>
            </section>
          )}

          {/* Past */}
          {past.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-base font-semibold text-[#1A3A52]/70">Past Shifts</h2>
              <div className="space-y-2">
                {past.map((a) => (
                  <ShiftRow key={a.shiftAssignmentId} a={a} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

