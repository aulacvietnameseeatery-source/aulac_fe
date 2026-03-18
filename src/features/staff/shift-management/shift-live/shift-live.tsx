"use client";

import { useMemo, useState } from "react";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALDatePicker } from "@/components/ui/al-date-picker";
import { ALCard } from "@/components/ui/al-card";
import { useShiftAssignmentsQuery } from "../hooks/use-shift-queries";
import { ShiftStatusBadge } from "../components/shift-status-badge";
import type { ShiftAssignmentListDto } from "../types/shift-management.types";

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

// ── main component ──

export function ShiftLive() {
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
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
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
