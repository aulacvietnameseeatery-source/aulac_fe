"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { AttendanceExceptionReportRowDto } from "../../types/shift-management.types";
import {
  INNER_TAB_LIST_CLASS,
  INNER_TAB_TRIGGER_CLASS,
  Kpi,
  TableState,
  InsightBanner,
  PaginationControls,
  exceptionBadgeClass,
  displayExceptionName,
} from "./report-shared";

interface Props {
  rows: AttendanceExceptionReportRowDto[];
  loading: boolean;
}

interface StaffExceptionGroup {
  staffId: number;
  staffName: string;
  rows: AttendanceExceptionReportRowDto[];
  late: number;
  absent: number;
  earlyLeave: number;
  totalMinutes: number;
}

function buildStaffGroups(rows: AttendanceExceptionReportRowDto[]): StaffExceptionGroup[] {
  const map = new Map<number, StaffExceptionGroup>();
  rows.forEach((r) => {
    const existing = map.get(r.staffId) ?? {
      staffId: r.staffId,
      staffName: r.staffName,
      rows: [],
      late: 0,
      absent: 0,
      earlyLeave: 0,
      totalMinutes: 0,
    };
    existing.rows.push(r);
    if (r.exceptionType === "LATE") existing.late += 1;
    if (r.exceptionType === "ABSENT") existing.absent += 1;
    if (r.exceptionType === "EARLY_LEAVE") existing.earlyLeave += 1;
    existing.totalMinutes += r.minutesAffected ?? 0;
    map.set(r.staffId, existing);
  });
  return [...map.values()].sort((a, b) => b.rows.length - a.rows.length);
}

function StaffExceptionAccordion({ group }: { group: StaffExceptionGroup }) {
  const t = useTranslations("ShiftManagement.Reports");
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border border-[#D5BA98]/60 bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="font-medium text-sm text-[#1A3A52] truncate">{group.staffName}</span>
          <div className="flex gap-1 flex-wrap">
            {group.late > 0 && (
              <Badge variant="outline" className="text-[10px] border-amber-600 bg-amber-600 text-white">
                Late ×{group.late}
              </Badge>
            )}
            {group.absent > 0 && (
              <Badge variant="outline" className="text-[10px] border-red-600 bg-red-600 text-white">
                Absent ×{group.absent}
              </Badge>
            )}
            {group.earlyLeave > 0 && (
              <Badge variant="outline" className="text-[10px] border-blue-600 bg-blue-600 text-white">
                Early ×{group.earlyLeave}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {group.totalMinutes > 0 && (
            <span className="text-xs text-[#1A3A52]/45">{group.totalMinutes}m affected</span>
          )}
          {open ? (
            <ChevronUp className="w-3.5 h-3.5 text-[#1A3A52]/45" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-[#1A3A52]/45" />
          )}
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-100 overflow-x-auto">
          <table className="w-full text-xs min-w-[400px]">
            <thead className="bg-[#1A3A52]/4">
              <tr>
                {[t("exceptionsTab.table.date"), t("exceptionsTab.table.shift"), t("exceptionsTab.table.exceptionType"), t("exceptionsTab.table.minutes"), t("exceptionsTab.table.reviewer")].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left font-semibold uppercase tracking-wide text-[#1A3A52]/55 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {group.rows.map((r, i) => (
                <tr
                  key={i}
                  className={`hover:bg-[#1A3A52]/3 ${r.isManualAdjustment ? "bg-blue-50/60" : ""}`}
                >
                  <td className="px-3 py-2 text-[#1A3A52]/75 whitespace-nowrap">{r.workDate}</td>
                  <td className="px-3 py-2 text-[#1A3A52]/60">{r.templateName ?? "—"}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-semibold ${exceptionBadgeClass(r.exceptionType)}`}
                    >
                      {displayExceptionName(r.exceptionType)}
                    </Badge>
                    {r.isManualAdjustment && (
                      <Badge
                        variant="outline"
                        className="ml-1 text-[10px] border-blue-600 bg-blue-600 text-white"
                      >
                        {t("exceptionsTab.adjustedLabel")}
                      </Badge>
                    )}
                  </td>
                  <td className="px-3 py-2 text-[#1A3A52]/65">
                    {r.minutesAffected > 0 ? `${r.minutesAffected}m` : "—"}
                  </td>
                  <td className="px-3 py-2 text-[#1A3A52]/50">{r.reviewerName ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function ExceptionsTab({ rows, loading }: Props) {
  const t = useTranslations("ShiftManagement.Reports");
  const [innerTab, setInnerTab] = useState("summary");
  const [staffQuery, setStaffQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const filteredRows = useMemo(() => {
    if (!staffQuery.trim()) return rows;
    return rows.filter((r) =>
      r.staffName.toLowerCase().includes(staffQuery.trim().toLowerCase())
    );
  }, [rows, staffQuery]);

  const late = filteredRows.filter((r) => r.exceptionType === "LATE").length;
  const absent = filteredRows.filter((r) => r.exceptionType === "ABSENT").length;
  const earlyLeave = filteredRows.filter((r) => r.exceptionType === "EARLY_LEAVE").length;
  const manual = filteredRows.filter((r) => r.isManualAdjustment).length;
  const totalMinutes = filteredRows.reduce((s, r) => s + (r.minutesAffected ?? 0), 0);

  const staffGroups = useMemo(() => buildStaffGroups(filteredRows), [filteredRows]);

  const trendData = useMemo(() => {
    const byDate = new Map<
      string,
      { date: string; late: number; absent: number; earlyLeave: number }
    >();
    filteredRows.forEach((r) => {
      const entry = byDate.get(r.workDate) ?? {
        date: r.workDate,
        late: 0,
        absent: 0,
        earlyLeave: 0,
      };
      if (r.exceptionType === "LATE") entry.late += 1;
      else if (r.exceptionType === "ABSENT") entry.absent += 1;
      else if (r.exceptionType === "EARLY_LEAVE") entry.earlyLeave += 1;
      byDate.set(r.workDate, entry);
    });
    return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredRows]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full max-w-sm">
          <input
            value={staffQuery}
            onChange={(e) => setStaffQuery(e.target.value)}
            placeholder={t("exceptionsTab.searchPlaceholder")}
            className="h-8 w-full rounded-lg border border border-[#D5BA98]/60 bg-[#FDFBF9] px-3 text-sm text-[#1A3A52] placeholder:text-[#1A3A52]/40 focus:outline-none focus:ring-2 focus:ring-[#1A3A52]/20"
          />
        </div>
        {staffQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="text-[#1A3A52]/60 hover:text-[#1A3A52] hover:bg-transparent h-8 px-2 text-xs font-medium"
            onClick={() => setStaffQuery("")}
          >
            {t("exceptionsTab.clearSearch")}
          </Button>
        )}
      </div>

      {filteredRows.length > 0 && (
        <InsightBanner
          type={filteredRows.length > 10 ? "warning" : "info"}
          message={`${filteredRows.length} exception${filteredRows.length > 1 ? "s" : ""} recorded.${totalMinutes > 0 ? ` Total impact: ${totalMinutes} minutes.` : ""}${manual > 0 ? ` ${manual} manually adjusted.` : ""}`}
        />
      )}

      <Tabs value={innerTab} onValueChange={setInnerTab}>
        <TabsList variant={"line"} className={INNER_TAB_LIST_CLASS}>
          <TabsTrigger value="summary" className={INNER_TAB_TRIGGER_CLASS}>
            {t("exceptionsTab.inner.summary")}
          </TabsTrigger>
          <TabsTrigger value="byStaff" className={INNER_TAB_TRIGGER_CLASS}>
            {t("exceptionsTab.inner.byStaff")}
          </TabsTrigger>
          <TabsTrigger value="details" className={INNER_TAB_TRIGGER_CLASS}>
            {t("exceptionsTab.inner.allRecords")}
          </TabsTrigger>
        </TabsList>

        {/* ── Summary ── */}
        <TabsContent value="summary" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <Kpi label={t("exceptionsTab.kpi.lateIncidents")} value={late} />
            <Kpi label={t("exceptionsTab.kpi.absences")} value={absent} />
            <Kpi label={t("exceptionsTab.kpi.earlyDepartures")} value={earlyLeave} />
            <Kpi label={t("exceptionsTab.kpi.manualAdjustments")} value={manual} />
            <Kpi label={t("exceptionsTab.kpi.totalMinutes")} value={`${totalMinutes}m`} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="border-amber-200 bg-amber-50 py-2.5 shadow-sm">
              <CardContent className="px-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700/70">
                  {t("exceptionsTab.cards.lateArrivals")}
                </p>
                <p className="mt-1 text-xl font-semibold text-amber-700">{late}</p>
              </CardContent>
            </Card>
            <Card className="border-red-200 bg-red-50 py-2.5 shadow-sm">
              <CardContent className="px-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-red-700/70">
                  {t("exceptionsTab.cards.absences")}
                </p>
                <p className="mt-1 text-xl font-semibold text-red-700">{absent}</p>
              </CardContent>
            </Card>
            <Card className="border-blue-200 bg-blue-50 py-2.5 shadow-sm">
              <CardContent className="px-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-700/70">
                  {t("exceptionsTab.cards.earlyLeave")}
                </p>
                <p className="mt-1 text-xl font-semibold text-blue-700">{earlyLeave}</p>
              </CardContent>
            </Card>
            <Card className="border-emerald-200 bg-emerald-50 py-2.5 shadow-sm">
              <CardContent className="px-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700/70">
                  {t("exceptionsTab.cards.adjusted")}
                </p>
                <p className="mt-1 text-xl font-semibold text-emerald-700">{manual}</p>
              </CardContent>
            </Card>
          </div>

          {trendData.length > 1 && (
            <Card className="border border-[#D5BA98]/60 bg-white shadow-sm overflow-hidden">
              <CardHeader className="bg-[#D5BA98]/10 py-3 border-b border-slate-100">
                <CardTitle className="text-sm font-semibold text-[#1A3A52]">
                  Exception Trends Over Time
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-5">
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: "#64748b" }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid #E2E8F0",
                          fontSize: "12px",
                        }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                      <Line dataKey="late" name="Late" stroke="#d97706" strokeWidth={2} dot={false} />
                      <Line dataKey="absent" name="Absent" stroke="#dc2626" strokeWidth={2} dot={false} />
                      <Line
                        dataKey="earlyLeave"
                        name="Early Leave"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── By Staff accordion ── */}
        <TabsContent value="byStaff" className="mt-4">
          {loading || staffGroups.length === 0 ? (
            <TableState loading={loading} />
          ) : (
            <div className="space-y-2">
              {staffGroups.map((group) => (
                <StaffExceptionAccordion key={group.staffId} group={group} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── All Records table ── */}
        <TabsContent value="details" className="mt-4">
          {loading || filteredRows.length === 0 ? (
            <TableState loading={loading} />
          ) : (
            <div className="overflow-x-auto rounded-xl border border border-[#D5BA98]/60 bg-white shadow-sm">
              <table className="w-full text-sm min-w-[540px]">
                <thead className="bg-[#1A3A52]/5">
                  <tr>
                    {["Date", "Staff", "Shift", "Exception", "Min Affected", "Reviewer"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#1A3A52]/65 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRows
                    .slice((page - 1) * pageSize, page * pageSize)
                    .map((r, i) => (
                      <tr
                        key={i}
                        className={`transition-colors hover:bg-[#1A3A52]/4 ${
                          r.isManualAdjustment ? "bg-blue-50/40" : ""
                        }`}
                      >
                        <td className="px-4 py-2.5 text-[#1A3A52] whitespace-nowrap text-xs">
                          {r.workDate}
                        </td>
                        <td className="px-4 py-2.5 font-medium text-[#1A3A52] whitespace-nowrap">
                          {r.staffName}
                        </td>
                        <td className="px-4 py-2.5 text-[#1A3A52]/60 text-xs">
                          {r.templateName ?? "—"}
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-semibold ${exceptionBadgeClass(r.exceptionType)}`}
                          >
                            {displayExceptionName(r.exceptionType)}
                          </Badge>
                          {r.isManualAdjustment && (
                            <Badge
                              variant="outline"
                              className="ml-1 text-[10px] border-blue-600 bg-blue-600 text-white"
                            >
                              {t("exceptionsTab.adjustedLabel")}
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-[#1A3A52]/65 text-xs">
                          {r.minutesAffected > 0 ? `${r.minutesAffected}m` : "—"}
                        </td>
                        <td className="px-4 py-2.5 text-[#1A3A52]/50 text-xs">
                          {r.reviewerName ?? "—"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              <PaginationControls
                page={page}
                pageSize={pageSize}
                total={filteredRows.length}
                setPage={setPage}
                setPageSize={setPageSize}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
