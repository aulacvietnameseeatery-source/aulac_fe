"use client";

import { useMemo, useState } from "react";
import { BarChart2, RefreshCcw } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ALDatePicker } from "@/components/ui/al-date-picker";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import {
  useAttendanceReportQuery,
  useWorkedHoursReportQuery,
  useExceptionsReportQuery,
} from "../hooks/use-shift-queries";
import type {
  AttendanceReportRowDto,
  WorkedHoursReportRowDto,
  AttendanceExceptionReportRowDto,
} from "../types/shift-management.types";

// ── helpers ──

function minToHM(min: number) {
  if (!min) return "0h 0m";
  return `${Math.floor(min / 60)}h ${min % 60}m`;
}

function pct(n: number, d: number) {
  if (!d) return "—";
  return `${Math.round((n / d) * 100)}%`;
}

function attendanceBadgeClass(statusCode: string) {
  const code = statusCode.toUpperCase();
  if (code === "ABSENT") return "border-red-500 bg-red-500 text-white shadow-sm";
  if (code === "LATE") return "border-amber-500 bg-amber-500 text-white shadow-sm";
  if (code === "ACTIVE" || code === "ON_DUTY") return "border-blue-500 bg-blue-500 text-white shadow-sm";
  if (code === "COMPLETED") return "border-emerald-500 bg-emerald-500 text-white shadow-sm";
  return "border-slate-600 bg-slate-600 text-white shadow-sm";
}

function exceptionBadgeClass(exceptionType: string) {
  const code = exceptionType.toUpperCase();
  if (code === "ABSENT") return "border-red-500 bg-red-500 text-white shadow-sm";
  if (code === "LATE" || code === "EARLY_LEAVE") return "border-amber-500 bg-amber-500 text-white shadow-sm";
  return "border-slate-600 bg-slate-600 text-white shadow-sm";
}

interface StaffAttendanceSummary {
  staffId: number;
  staffName: string;
  total: number;
  present: number;
  late: number;
  absent: number;
  onTime: number;
}

function buildStaffSummary(rows: AttendanceReportRowDto[]): StaffAttendanceSummary[] {
  const byStaff = new Map<number, StaffAttendanceSummary>();

  rows.forEach((r) => {
    const existing = byStaff.get(r.staffId) ?? {
      staffId: r.staffId,
      staffName: r.staffName,
      total: 0,
      present: 0,
      late: 0,
      absent: 0,
      onTime: 0,
    };

    existing.total += 1;
    if (r.actualCheckInAt) existing.present += 1;
    if (r.attendanceStatusCode?.toUpperCase() === "ABSENT") existing.absent += 1;
    if (r.lateMinutes > 0 || r.attendanceStatusCode?.toUpperCase() === "LATE") existing.late += 1;
    if (r.actualCheckInAt && (r.lateMinutes ?? 0) === 0 && r.attendanceStatusCode?.toUpperCase() !== "LATE") {
      existing.onTime += 1;
    }

    byStaff.set(r.staffId, existing);
  });

  return [...byStaff.values()].sort((a, b) => b.total - a.total || a.staffName.localeCompare(b.staffName));
}

function thisMonthRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
  return { from, to };
}

// ── filter bar ──

interface FiltersState {
  fromDate: string;
  toDate: string;
}

interface FilterBarProps {
  filters: FiltersState;
  onChange: (f: FiltersState) => void;
  onRefetch: () => void;
  isLoading: boolean;
}

function FilterBar({ filters, onChange, onRefetch, isLoading }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <label className="text-sm text-[#1A3A52]/70">From:</label>
      <ALDatePicker
        value={filters.fromDate}
        onChange={(val) => onChange({ ...filters, fromDate: val })}
        placeholder="From date"
        clearable
        inputSize="sm"
        wrapperClassName="w-48"
      />
      <label className="text-sm text-[#1A3A52]/70">To:</label>
      <ALDatePicker
        value={filters.toDate}
        onChange={(val) => onChange({ ...filters, toDate: val })}
        placeholder="To date"
        clearable
        inputSize="sm"
        wrapperClassName="w-48"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={onRefetch}
        disabled={isLoading}
        className="border-slate-300 bg-white text-[#1A3A52] hover:bg-slate-100"
      >
        <RefreshCcw className="w-4 h-4" />
      </Button>

      <div className="ml-auto">
        <Button size="sm" variant="outline" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 bg-white shadow-sm">
          Export CSV
        </Button>
      </div>
    </div>
  );
}

// ── KPI cards ──

interface KpiProps {
  label: string;
  value: string | number;
  sub?: string;
}

function Kpi({ label, value, sub }: KpiProps) {
  return (
    <Card className="border-slate-200 bg-white py-4 shadow-sm">
      <CardContent className="px-5">
        <p className="text-2xl font-semibold leading-none text-[#1A3A52]">{value}</p>
        {sub && <p className="mt-0.5 text-sm text-[#1A3A52]/70">{sub}</p>}
        <p className="mt-1 text-xs text-[#1A3A52]/65">{label}</p>
      </CardContent>
    </Card>
  );
}

// ── empty / loading states ──

function TableState({ loading }: { loading: boolean }) {
  return (
    <div className="flex items-center justify-center py-14 text-sm text-[#1A3A52]/70">
      {loading ? "Loading…" : "No data for the selected range."}
    </div>
  );
}

// ── Attendance tab ──

function AttendanceTab({ rows, loading }: { rows: AttendanceReportRowDto[]; loading: boolean }) {
  const [summaryTab, setSummaryTab] = useState("overview");
  const [staffQuery, setStaffQuery] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState("all");

  const staffSummary = useMemo(() => buildStaffSummary(rows), [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const byId = selectedStaffId === "all" || String(r.staffId) === selectedStaffId;
      const byQuery = staffQuery.trim().length === 0
        || r.staffName.toLowerCase().includes(staffQuery.trim().toLowerCase());
      return byId && byQuery;
    });
  }, [rows, selectedStaffId, staffQuery]);

  const filteredStaffSummary = useMemo(
    () => buildStaffSummary(filteredRows),
    [filteredRows]
  );

  const total = filteredRows.length;
  const present = filteredRows.filter((r) => r.actualCheckInAt).length;
  const late = filteredRows.filter((r) => r.lateMinutes > 0).length;
  const absent = filteredRows.filter((r) => r.attendanceStatusCode === "ABSENT").length;
  const onTime = filteredRows.filter((r) => r.actualCheckInAt && (r.lateMinutes ?? 0) === 0 && r.attendanceStatusCode !== "LATE").length;

  const statusCards = [
    {
      key: "on-time",
      label: "On Time",
      value: onTime,
      hint: pct(onTime, total),
      className: "border-blue-200 bg-blue-50",
      valueClass: "text-blue-700",
    },
    {
      key: "late",
      label: "Late",
      value: late,
      hint: pct(late, total),
      className: "border-amber-200 bg-amber-50",
      valueClass: "text-amber-700",
    },
    {
      key: "absent",
      label: "Absent",
      value: absent,
      hint: pct(absent, total),
      className: "border-red-200 bg-red-50",
      valueClass: "text-red-700",
    },
    {
      key: "present",
      label: "Present",
      value: present,
      hint: pct(present, total),
      className: "border-emerald-200 bg-emerald-50",
      valueClass: "text-emerald-700",
    },
  ];

  const chartData = useMemo(() => {
    const byDate = new Map<string, { date: string; onTime: number; late: number; absent: number }>();
    filteredRows.forEach((r) => {
      const existing = byDate.get(r.workDate) || { date: r.workDate, onTime: 0, late: 0, absent: 0 };
      if (r.attendanceStatusCode === "ABSENT") existing.absent += 1;
      else if (r.lateMinutes > 0 || r.attendanceStatusCode === "LATE") existing.late += 1;
      else if (r.actualCheckInAt) existing.onTime += 1;
      byDate.set(r.workDate, existing);
    });

    return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredRows]);

  const staffOptions = useMemo(() => {
    return [{ id: "all", name: "All staff" }].concat(
      staffSummary.map((s) => ({ id: String(s.staffId), name: s.staffName }))
    );
  }, [staffSummary]);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wide text-[#1A3A52]/65">Find staff</label>
            <input
              value={staffQuery}
              onChange={(e) => setStaffQuery(e.target.value)}
              placeholder="Type staff name..."
              className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-[#1A3A52] placeholder:text-[#1A3A52]/45 focus:outline-none focus:ring-2 focus:ring-[#1A3A52]/35"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wide text-[#1A3A52]/65">Quick staff filter</label>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-[#1A3A52] focus:outline-none focus:ring-2 focus:ring-[#1A3A52]/35"
            >
              {staffOptions.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              className="h-9 w-full border-slate-300 bg-white text-[#1A3A52] hover:bg-slate-100"
              onClick={() => {
                setStaffQuery("");
                setSelectedStaffId("all");
              }}
            >
              Reset staff filter
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Total assignments" value={total} />
        <Kpi label="Check-in rate" value={pct(present, total)} sub={`${present} / ${total}`} />
        <Kpi label="Late arrivals" value={late} />
        <Kpi label="Absences" value={absent} />
      </div>

      <Tabs value={summaryTab} onValueChange={setSummaryTab}>
        <TabsList className="border border-slate-200 bg-white shadow-sm">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#1A3A52] data-[state=active]:text-white">Status Overview</TabsTrigger>
          <TabsTrigger value="staffSummary" className="data-[state=active]:bg-[#1A3A52] data-[state=active]:text-white">Staff Summary</TabsTrigger>
          <TabsTrigger value="details" className="data-[state=active]:bg-[#1A3A52] data-[state=active]:text-white">Attendance Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {statusCards.map((s) => (
              <Card key={s.key} className={`border ${s.className} py-4 shadow-sm`}>
                <CardContent className="px-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-[#1A3A52]/70">{s.label}</p>
                  <p className={`mt-1 text-3xl font-semibold leading-none ${s.valueClass}`}>{s.value}</p>
                  <p className="mt-1 text-xs text-[#1A3A52]/70">{s.hint} of filtered records</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
            <CardHeader className="bg-[#D5BA98]/10 py-3 border-b border-slate-200">
              <CardTitle className="text-sm font-semibold text-[#1A3A52]">Attendance Trends</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-6">
              <div className="h-75 w-full">
                {chartData.length === 0 ? (
                  <div className="h-full w-full flex items-center justify-center text-sm text-[#1A3A52]/60 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                    No data available for the selected filters
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} tickMargin={10} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                      <Tooltip
                        cursor={{ fill: "transparent" }}
                        contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 15 }} />
                      <Bar dataKey="onTime" name="On Time" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                      <Bar dataKey="late" name="Late" stackId="a" fill="#f59e0b" />
                      <Bar dataKey="absent" name="Absent" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staffSummary" className="mt-4 space-y-4">
          {filteredStaffSummary.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white py-8 text-center text-sm text-[#1A3A52]/70 shadow-sm">
              No staff summary available for current filter.
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredStaffSummary.slice(0, 9).map((s) => (
                  <div key={s.staffId} className="space-y-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                    <p className="truncate text-sm font-semibold text-[#1A3A52]">{s.staffName}</p>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="outline" className="border-slate-600 bg-slate-600 text-white">Total: {s.total}</Badge>
                      <Badge variant="outline" className="border-emerald-500 bg-emerald-500 text-white">Present: {s.present}</Badge>
                      <Badge variant="outline" className="border-blue-500 bg-blue-500 text-white">On Time: {s.onTime}</Badge>
                      <Badge variant="outline" className="border-amber-500 bg-amber-500 text-white">Late: {s.late}</Badge>
                      <Badge variant="outline" className="border-red-500 bg-red-500 text-white">Absent: {s.absent}</Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-[#D5BA98]/15">
                    <tr>
                      {[
                        "Staff",
                        "Total",
                        "Present",
                        "On Time",
                        "Late",
                        "Absent",
                        "Check-in Rate",
                      ].map((h) => (
                        <th key={h} className="px-4 py-3 text-left font-medium text-[#1A3A52]/80">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredStaffSummary.map((s) => (
                      <tr key={s.staffId} className="transition-colors hover:bg-[#D5BA98]/12">
                        <td className="px-4 py-3 font-medium text-[#1A3A52]">{s.staffName}</td>
                        <td className="px-4 py-3 text-[#1A3A52]">{s.total}</td>
                        <td className="px-4 py-3 text-emerald-700">{s.present}</td>
                        <td className="px-4 py-3 text-blue-700">{s.onTime}</td>
                        <td className="px-4 py-3 text-amber-700">{s.late}</td>
                        <td className="px-4 py-3 text-red-700">{s.absent}</td>
                        <td className="px-4 py-3 text-[#1A3A52]">{pct(s.present, s.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="details" className="mt-4">
          {!loading && filteredRows.length === 0 ? (
            <TableState loading={loading} />
          ) : loading ? (
            <TableState loading={loading} />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-[#D5BA98]/15">
                  <tr>
                    {["Date", "Staff", "Shift", "Status", "Check-in", "Check-out", "Late"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-medium text-[#1A3A52]/80">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredRows.map((r, i) => (
                    <tr key={r.shiftAssignmentId || i} className="transition-colors hover:bg-[#D5BA98]/12">
                      <td className="px-4 py-3 text-[#1A3A52]">{r.workDate}</td>
                      <td className="px-4 py-3 font-medium text-[#1A3A52]">{r.staffName}</td>
                      <td className="px-4 py-3 text-[#1A3A52]">{r.templateName}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`font-semibold ${attendanceBadgeClass(r.attendanceStatusCode)}`}>
                          {r.attendanceStatusCode}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-[#1A3A52]">{r.actualCheckInAt ? new Date(r.actualCheckInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                      <td className="px-4 py-3 text-[#1A3A52]">{r.actualCheckOutAt ? new Date(r.actualCheckOutAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                      <td className="px-4 py-3">
                        {r.lateMinutes > 0 ? (
                          <Badge variant="outline" className="border-amber-500 bg-amber-500 font-semibold text-white shadow-sm">{r.lateMinutes}m</Badge>
                        ) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Worked Hours tab ──

function WorkedHoursTab({ rows, loading }: { rows: WorkedHoursReportRowDto[]; loading: boolean }) {
  const [innerTab, setInnerTab] = useState("summary");
  const [staffQuery, setStaffQuery] = useState("");

  const filteredRows = useMemo(() => {
    if (!staffQuery.trim()) return rows;
    return rows.filter((r) => r.staffName.toLowerCase().includes(staffQuery.trim().toLowerCase()));
  }, [rows, staffQuery]);

  const totalSched = filteredRows.reduce((s, r) => s + r.scheduledMinutes, 0);
  const totalWorked = filteredRows.reduce((s, r) => s + r.workedMinutes, 0);
  const totalVariance = filteredRows.reduce((s, r) => s + r.varianceMinutes, 0);
  const incompleteCount = filteredRows.reduce((s, r) => s + (r.incompleteRecords > 0 ? 1 : 0), 0);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1 sm:col-span-2 lg:col-span-2">
            <label className="text-xs font-medium uppercase tracking-wide text-[#1A3A52]/65">Find staff</label>
            <input
              value={staffQuery}
              onChange={(e) => setStaffQuery(e.target.value)}
              placeholder="Type staff name..."
              className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-[#1A3A52] placeholder:text-[#1A3A52]/45 focus:outline-none focus:ring-2 focus:ring-[#1A3A52]/35"
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              className="h-9 w-full border-slate-300 bg-white text-[#1A3A52] hover:bg-slate-100"
              onClick={() => setStaffQuery("")}
            >
              Reset search
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={innerTab} onValueChange={setInnerTab}>
        <TabsList className="border border-slate-200 bg-white shadow-sm">
          <TabsTrigger value="summary" className="data-[state=active]:bg-[#1A3A52] data-[state=active]:text-white">Summary</TabsTrigger>
          <TabsTrigger value="details" className="data-[state=active]:bg-[#1A3A52] data-[state=active]:text-white">Staff Details</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi label="Total scheduled" value={minToHM(totalSched)} />
            <Kpi label="Total worked" value={minToHM(totalWorked)} />
            <Kpi
              label="Variance"
              value={`${totalVariance >= 0 ? "+" : ""}${minToHM(Math.abs(totalVariance))}`}
              sub={totalVariance < 0 ? "under" : "over"}
            />
            <Kpi label="Incomplete records" value={incompleteCount} />
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <Card className="border-blue-200 bg-blue-50 py-4 shadow-sm">
              <CardContent className="px-5">
                <p className="text-xs font-medium uppercase tracking-wide text-blue-700/80">Filtered Staff</p>
                <p className="mt-1 text-3xl font-semibold leading-none text-blue-700">{filteredRows.length}</p>
              </CardContent>
            </Card>
            <Card className="border-emerald-200 bg-emerald-50 py-4 shadow-sm">
              <CardContent className="px-5">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-700/80">Worked Minutes</p>
                <p className="mt-1 text-3xl font-semibold leading-none text-emerald-700">{totalWorked}</p>
              </CardContent>
            </Card>
            <Card className="border-amber-200 bg-amber-50 py-4 shadow-sm">
              <CardContent className="px-5">
                <p className="text-xs font-medium uppercase tracking-wide text-amber-700/80">Scheduled Minutes</p>
                <p className="mt-1 text-3xl font-semibold leading-none text-amber-700">{totalSched}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details" className="mt-4">
          {!loading && filteredRows.length === 0 ? (
            <TableState loading={loading} />
          ) : loading ? (
            <TableState loading={loading} />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-[#D5BA98]/15">
                  <tr>
                    {["Staff", "Scheduled", "Worked", "Variance", "Incomplete"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-medium text-[#1A3A52]/80">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredRows.map((r) => (
                    <tr key={r.staffId} className="transition-colors hover:bg-[#D5BA98]/12">
                      <td className="px-4 py-3 font-medium text-[#1A3A52]">{r.staffName}</td>
                      <td className="px-4 py-3 text-[#1A3A52]">{minToHM(r.scheduledMinutes)}</td>
                      <td className="px-4 py-3 text-[#1A3A52]">{minToHM(r.workedMinutes)}</td>
                      <td className={`px-4 py-3 font-medium ${r.varianceMinutes < 0 ? "text-red-700" : "text-emerald-700"}`}>
                        {r.varianceMinutes >= 0 ? "+" : ""}{minToHM(Math.abs(r.varianceMinutes))}
                      </td>
                      <td className="px-4 py-3">
                        {r.incompleteRecords > 0 ? (
                          <Badge variant="outline" className="border-amber-500 bg-amber-500 font-semibold text-white shadow-sm">{r.incompleteRecords}</Badge>
                        ) : (
                          <span className="text-[#1A3A52]/50">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Exceptions tab ──

function ExceptionsTab({ rows, loading }: { rows: AttendanceExceptionReportRowDto[]; loading: boolean }) {
  const [innerTab, setInnerTab] = useState("summary");
  const [staffQuery, setStaffQuery] = useState("");

  const filteredRows = useMemo(() => {
    if (!staffQuery.trim()) return rows;
    return rows.filter((r) => r.staffName.toLowerCase().includes(staffQuery.trim().toLowerCase()));
  }, [rows, staffQuery]);

  const late = filteredRows.filter((r) => r.exceptionType === "LATE").length;
  const absent = filteredRows.filter((r) => r.exceptionType === "ABSENT").length;
  const earlyLeave = filteredRows.filter((r) => r.exceptionType === "EARLY_LEAVE").length;
  const manual = filteredRows.filter((r) => r.isManualAdjustment).length;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1 sm:col-span-2 lg:col-span-2">
            <label className="text-xs font-medium uppercase tracking-wide text-[#1A3A52]/65">Find staff</label>
            <input
              value={staffQuery}
              onChange={(e) => setStaffQuery(e.target.value)}
              placeholder="Type staff name..."
              className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-[#1A3A52] placeholder:text-[#1A3A52]/45 focus:outline-none focus:ring-2 focus:ring-[#1A3A52]/35"
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              className="h-9 w-full border-slate-300 bg-white text-[#1A3A52] hover:bg-slate-100"
              onClick={() => setStaffQuery("")}
            >
              Reset search
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={innerTab} onValueChange={setInnerTab}>
        <TabsList className="border border-slate-200 bg-white shadow-sm">
          <TabsTrigger value="summary" className="data-[state=active]:bg-[#1A3A52] data-[state=active]:text-white">Summary</TabsTrigger>
          <TabsTrigger value="details" className="data-[state=active]:bg-[#1A3A52] data-[state=active]:text-white">Exception Details</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi label="Late incidents" value={late} />
            <Kpi label="Absences" value={absent} />
            <Kpi label="Early departures" value={earlyLeave} />
            <Kpi label="Manual adjustments" value={manual} />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-amber-200 bg-amber-50 py-4 shadow-sm">
              <CardContent className="px-5">
                <p className="text-xs font-medium uppercase tracking-wide text-amber-700/80">Late</p>
                <p className="mt-1 text-3xl font-semibold leading-none text-amber-700">{late}</p>
              </CardContent>
            </Card>
            <Card className="border-red-200 bg-red-50 py-4 shadow-sm">
              <CardContent className="px-5">
                <p className="text-xs font-medium uppercase tracking-wide text-red-700/80">Absent</p>
                <p className="mt-1 text-3xl font-semibold leading-none text-red-700">{absent}</p>
              </CardContent>
            </Card>
            <Card className="border-blue-200 bg-blue-50 py-4 shadow-sm">
              <CardContent className="px-5">
                <p className="text-xs font-medium uppercase tracking-wide text-blue-700/80">Early Leave</p>
                <p className="mt-1 text-3xl font-semibold leading-none text-blue-700">{earlyLeave}</p>
              </CardContent>
            </Card>
            <Card className="border-emerald-200 bg-emerald-50 py-4 shadow-sm">
              <CardContent className="px-5">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-700/80">Adjusted</p>
                <p className="mt-1 text-3xl font-semibold leading-none text-emerald-700">{manual}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details" className="mt-4">
          {!loading && filteredRows.length === 0 ? (
            <TableState loading={loading} />
          ) : loading ? (
            <TableState loading={loading} />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-[#D5BA98]/15">
                  <tr>
                    {["Date", "Staff", "Shift", "Exception", "Min Affected", "Reviewed By"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-medium text-[#1A3A52]/80">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredRows.map((r, i) => (
                    <tr key={i} className="transition-colors hover:bg-[#D5BA98]/12">
                      <td className="px-4 py-3 text-[#1A3A52]">{r.workDate}</td>
                      <td className="px-4 py-3 font-medium text-[#1A3A52]">{r.staffName}</td>
                      <td className="px-4 py-3 text-[#1A3A52]/70">{r.templateName ?? "—"}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`font-semibold ${exceptionBadgeClass(r.exceptionType)}`}>
                          {r.exceptionType}
                        </Badge>
                        {r.isManualAdjustment && (
                          <Badge variant="outline" className="ml-1 border-blue-500 bg-blue-500 font-semibold text-white shadow-sm">Adjusted</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[#1A3A52]">{r.minutesAffected > 0 ? r.minutesAffected : "—"}</td>
                      <td className="px-4 py-3 text-[#1A3A52]/70">{r.reviewerName ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── main component ──

export function ShiftReports() {
  const defaultRange = thisMonthRange();
  const [filters, setFilters] = useState<FiltersState>({
    fromDate: defaultRange.from,
    toDate: defaultRange.to,
  });
  const [activeTab, setActiveTab] = useState("attendance");

  const enabled = !!filters.fromDate && !!filters.toDate;

  const { data: attendancePage, isLoading: attLoading, refetch: attRefetch } =
    useAttendanceReportQuery(
      enabled ? { fromDate: filters.fromDate, toDate: filters.toDate, pageSize: 100 } : {}
    );

  const { data: workedHours = [], isLoading: whLoading, refetch: whRefetch } =
    useWorkedHoursReportQuery(
      { fromDate: filters.fromDate, toDate: filters.toDate },
      enabled && activeTab === "workedHours"
    );

  const { data: exceptions = [], isLoading: excLoading, refetch: excRefetch } =
    useExceptionsReportQuery(
      { fromDate: filters.fromDate, toDate: filters.toDate },
      enabled && activeTab === "exceptions"
    );

  const attendanceRows = attendancePage?.pageData ?? [];
  const reportSnapshot = {
    attendanceCount: attendanceRows.length,
    workedStaffCount: workedHours.length,
    exceptionCount: exceptions.length,
  };

  function handleRefetch() {
    if (activeTab === "attendance") attRefetch();
    else if (activeTab === "workedHours") whRefetch();
    else excRefetch();
  }

  const isLoading = activeTab === "attendance" ? attLoading : activeTab === "workedHours" ? whLoading : excLoading;

  return (
    <div className="space-y-6 rounded-2xl border border-[#D5BA98]/40 bg-[#FDFBF9] p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-5">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-[#1A3A52]/80" />
            <h1 className="text-2xl font-semibold tracking-wide text-[#1A3A52]">Shift Reports</h1>
          </div>
          <p className="mt-0.5 text-sm text-[#1A3A52]/70">
            Attendance summary, worked hours, and exception reports.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Filter and Global KPIs */}
        <div className="lg:col-span-3 space-y-4 lg:sticky lg:top-6">
          <FilterBar
            filters={filters}
            onChange={setFilters}
            onRefetch={handleRefetch}
            isLoading={isLoading}
          />

          <Card className="border-blue-200 bg-blue-50 py-3 shadow-sm">
            <CardContent className="px-4">
              <p className="text-xs font-medium uppercase tracking-wide text-blue-700/80">Total Attendance</p>
              <p className="mt-1 text-2xl font-semibold leading-none text-blue-700">{reportSnapshot.attendanceCount}</p>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-emerald-50 py-3 shadow-sm">
            <CardContent className="px-4">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700/80">Staff Found</p>
              <p className="mt-1 text-2xl font-semibold leading-none text-emerald-700">{reportSnapshot.workedStaffCount}</p>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50 py-3 shadow-sm">
            <CardContent className="px-4">
              <p className="text-xs font-medium uppercase tracking-wide text-amber-700/80">Total Exceptions</p>
              <p className="mt-1 text-2xl font-semibold leading-none text-amber-700">{reportSnapshot.exceptionCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Main Content */}
        <div className="lg:col-span-9">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="border border-slate-200 bg-white shadow-sm w-full h-auto p-1 grid grid-cols-3">
              <TabsTrigger value="attendance" className="data-[state=active]:bg-[#1A3A52] data-[state=active]:text-[#FDFBF9] py-2">Attendance</TabsTrigger>
              <TabsTrigger value="workedHours" className="data-[state=active]:bg-[#1A3A52] data-[state=active]:text-[#FDFBF9] py-2">Worked Hours</TabsTrigger>
              <TabsTrigger value="exceptions" className="data-[state=active]:bg-[#1A3A52] data-[state=active]:text-[#FDFBF9] py-2">Exceptions</TabsTrigger>
            </TabsList>

            <TabsContent value="attendance" className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <AttendanceTab rows={attendanceRows} loading={attLoading} />
            </TabsContent>

            <TabsContent value="workedHours" className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <WorkedHoursTab rows={workedHours} loading={whLoading} />
            </TabsContent>

            <TabsContent value="exceptions" className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <ExceptionsTab rows={exceptions} loading={excLoading} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

