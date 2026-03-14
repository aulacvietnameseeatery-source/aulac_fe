"use client";

import { useState } from "react";
import { BarChart2, RefreshCcw } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ALDatePicker } from "@/components/ui/al-date-picker";
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
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#D5BA98]/50 bg-[#FDFBF9] p-3">
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
        className="border-[#D5BA98]/70 bg-[#FDFBF9] text-[#1A3A52] hover:bg-[#D5BA98]/20"
      >
        <RefreshCcw className="w-4 h-4" />
      </Button>
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
    <Card className="py-4 border-[#D5BA98]/50 bg-[#FDFBF9] shadow-none">
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
  const total = rows.reduce((s, r) => s + r.assignedShifts, 0);
  const present = rows.reduce((s, r) => s + r.presentShifts, 0);
  const late = rows.reduce((s, r) => s + r.lateShifts, 0);
  const absent = rows.reduce((s, r) => s + r.absentShifts, 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Kpi label="Total assigned shifts" value={total} />
        <Kpi label="Attendance rate" value={pct(present, total)} sub={`${present} / ${total}`} />
        <Kpi label="Late arrivals" value={late} />
        <Kpi label="Absences" value={absent} />
      </div>

      {!loading && rows.length === 0 ? (
        <TableState loading={loading} />
      ) : loading ? (
        <TableState loading={loading} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#D5BA98]/60 bg-[#FDFBF9]">
          <table className="w-full text-sm">
            <thead className="bg-[#D5BA98]/20">
              <tr>
                {["Staff", "Role", "Assigned", "Present", "Late", "Absent", "Rate"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-[#1A3A52]/80">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D5BA98]/40">
              {rows.map((r) => (
                <tr key={r.staffId} className="transition-colors hover:bg-[#D5BA98]/15">
                  <td className="px-4 py-3 font-medium text-[#1A3A52]">{r.staffName}</td>
                  <td className="px-4 py-3 text-[#1A3A52]/70">{r.roleName}</td>
                  <td className="px-4 py-3 text-[#1A3A52]">{r.assignedShifts}</td>
                  <td className="px-4 py-3 text-[#1A3A52]">{r.presentShifts}</td>
                  <td className="px-4 py-3">
                    {r.lateShifts > 0 ? (
                      <Badge variant="warning" className="border-[#D5BA98]/60 bg-[#D5BA98]/25 text-[#1A3A52]">{r.lateShifts}</Badge>
                    ) : r.lateShifts}
                  </td>
                  <td className="px-4 py-3">
                    {r.absentShifts > 0 ? (
                      <Badge variant="destructive">{r.absentShifts}</Badge>
                    ) : r.absentShifts}
                  </td>
                  <td className="px-4 py-3 text-[#1A3A52]">{pct(r.presentShifts, r.assignedShifts)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Worked Hours tab ──

function WorkedHoursTab({ rows, loading }: { rows: WorkedHoursReportRowDto[]; loading: boolean }) {
  const totalSched = rows.reduce((s, r) => s + r.scheduledMinutes, 0);
  const totalWorked = rows.reduce((s, r) => s + r.workedMinutes, 0);
  const totalVariance = rows.reduce((s, r) => s + r.varianceMinutes, 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Kpi label="Total scheduled" value={minToHM(totalSched)} />
        <Kpi label="Total worked" value={minToHM(totalWorked)} />
        <Kpi
          label="Variance"
          value={`${totalVariance >= 0 ? "+" : ""}${minToHM(Math.abs(totalVariance))}`}
          sub={totalVariance < 0 ? "under" : "over"}
        />
      </div>

      {!loading && rows.length === 0 ? (
        <TableState loading={loading} />
      ) : loading ? (
        <TableState loading={loading} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#D5BA98]/60 bg-[#FDFBF9]">
          <table className="w-full text-sm">
            <thead className="bg-[#D5BA98]/20">
              <tr>
                {["Staff", "Scheduled", "Worked", "Variance", "Incomplete"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-[#1A3A52]/80">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D5BA98]/40">
              {rows.map((r) => (
                <tr key={r.staffId} className="transition-colors hover:bg-[#D5BA98]/15">
                  <td className="px-4 py-3 font-medium text-[#1A3A52]">{r.staffName}</td>
                  <td className="px-4 py-3 text-[#1A3A52]">{minToHM(r.scheduledMinutes)}</td>
                  <td className="px-4 py-3 text-[#1A3A52]">{minToHM(r.workedMinutes)}</td>
                  <td className={`px-4 py-3 font-medium ${r.varianceMinutes < 0 ? "text-[#8C3A3A]" : "text-[#4A5D4E]"}`}>
                    {r.varianceMinutes >= 0 ? "+" : ""}{minToHM(Math.abs(r.varianceMinutes))}
                  </td>
                  <td className="px-4 py-3">
                    {r.incompleteRecords > 0 ? (
                      <Badge variant="warning" className="border-[#D5BA98]/60 bg-[#D5BA98]/25 text-[#1A3A52]">{r.incompleteRecords}</Badge>
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
    </div>
  );
}

// ── Exceptions tab ──

function ExceptionsTab({ rows, loading }: { rows: AttendanceExceptionReportRowDto[]; loading: boolean }) {
  const late = rows.filter((r) => r.exceptionType === "LATE").length;
  const absent = rows.filter((r) => r.exceptionType === "ABSENT").length;
  const earlyLeave = rows.filter((r) => r.exceptionType === "EARLY_LEAVE").length;
  const manual = rows.filter((r) => r.isManualAdjustment).length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Kpi label="Late incidents" value={late} />
        <Kpi label="Absences" value={absent} />
        <Kpi label="Early departures" value={earlyLeave} />
        <Kpi label="Manual adjustments" value={manual} />
      </div>

      {!loading && rows.length === 0 ? (
        <TableState loading={loading} />
      ) : loading ? (
        <TableState loading={loading} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#D5BA98]/60 bg-[#FDFBF9]">
          <table className="w-full text-sm">
            <thead className="bg-[#D5BA98]/20">
              <tr>
                {["Date", "Staff", "Role", "Shift", "Exception", "Min Affected", "Reviewed By"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-[#1A3A52]/80">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D5BA98]/40">
              {rows.map((r, i) => (
                <tr key={i} className="transition-colors hover:bg-[#D5BA98]/15">
                  <td className="px-4 py-3 text-[#1A3A52]">{r.businessDate}</td>
                  <td className="px-4 py-3 font-medium text-[#1A3A52]">{r.staffName}</td>
                  <td className="px-4 py-3 text-[#1A3A52]/70">{r.roleName}</td>
                  <td className="px-4 py-3 text-[#1A3A52]/70">{r.shiftTypeCode}</td>
                  <td className="px-4 py-3">
                    <Badge variant={r.exceptionType === "ABSENT" ? "destructive" : "warning"}>
                      {r.exceptionType}
                    </Badge>
                    {r.isManualAdjustment && (
                      <Badge variant="secondary" className="ml-1 border-[#D5BA98]/60 bg-[#D5BA98]/20 text-[#1A3A52]">Adjusted</Badge>
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

  function handleRefetch() {
    if (activeTab === "attendance") attRefetch();
    else if (activeTab === "workedHours") whRefetch();
    else excRefetch();
  }

  const isLoading = activeTab === "attendance" ? attLoading : activeTab === "workedHours" ? whLoading : excLoading;

  return (
    <div className="space-y-6 rounded-2xl border border-[#D5BA98]/40 bg-linear-to-b from-[#FDFBF9] via-[#D5BA98]/10 to-[#FDFBF9] p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
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

      {/* Filter bar */}
      <FilterBar
        filters={filters}
        onChange={setFilters}
        onRefetch={handleRefetch}
        isLoading={isLoading}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="border border-[#D5BA98]/60 bg-[#FDFBF9]">
          <TabsTrigger value="attendance" className="data-[state=active]:bg-[#1A3A52] data-[state=active]:text-[#FDFBF9]">Attendance</TabsTrigger>
          <TabsTrigger value="workedHours" className="data-[state=active]:bg-[#1A3A52] data-[state=active]:text-[#FDFBF9]">Worked Hours</TabsTrigger>
          <TabsTrigger value="exceptions" className="data-[state=active]:bg-[#1A3A52] data-[state=active]:text-[#FDFBF9]">Exceptions</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="mt-4">
          <AttendanceTab rows={attendanceRows} loading={attLoading} />
        </TabsContent>

        <TabsContent value="workedHours" className="mt-4">
          <WorkedHoursTab rows={workedHours} loading={whLoading} />
        </TabsContent>

        <TabsContent value="exceptions" className="mt-4">
          <ExceptionsTab rows={exceptions} loading={excLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

