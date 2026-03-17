"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ALInput } from "@/components/ui/al-input";
import { ALCombobox } from "@/components/ui/al-combobox";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { AttendanceReportRowDto } from "../../types/shift-management.types";
import {
  TAB_TRIGGER_CLASS,
  INNER_TAB_LIST_CLASS,
  INNER_TAB_TRIGGER_CLASS,
  TableState,
  PaginationControls,
  buildStaffSummary,
  pct,
  formatTime,
  attendanceBadgeClass,
  displayStatusName,
} from "./report-shared";

interface Props {
  rows: AttendanceReportRowDto[];
  loading: boolean;
}

function ReliabilityBadge({ score }: { score: number }) {
  if (score >= 90)
    return <span className="text-xs font-bold text-emerald-700">{score}</span>;
  if (score >= 70)
    return <span className="text-xs font-bold text-amber-700">{score}</span>;
  return <span className="text-xs font-bold text-red-700">{score}</span>;
}

export function AttendanceTab({ rows, loading }: Props) {
  const t = useTranslations("ShiftManagement.Reports");
  const [summaryTab, setSummaryTab] = useState("overview");
  const [staffQuery, setStaffQuery] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const handleDrillDown = (staffId: number) => {
    setStaffQuery("");
    setSelectedStaffId(String(staffId));
    setSummaryTab("details");
    setPage(1);
  };

  const staffSummary = useMemo(() => buildStaffSummary(rows), [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const byId = selectedStaffId === "all" || String(r.staffId) === selectedStaffId;
      const byQuery =
        staffQuery.trim().length === 0 ||
        r.staffName.toLowerCase().includes(staffQuery.trim().toLowerCase());
      return byId && byQuery;
    });
  }, [rows, selectedStaffId, staffQuery]);

  const filteredStaffSummary = useMemo(() => buildStaffSummary(filteredRows), [filteredRows]);

  const total = filteredRows.length;
  const present = filteredRows.filter((r) => r.actualCheckInAt).length;
  const late = filteredRows.filter(
    (r) => r.lateMinutes > 0 || r.attendanceStatusCode?.toUpperCase() === "LATE"
  ).length;
  const absent = filteredRows.filter(
    (r) => r.attendanceStatusCode?.toUpperCase() === "ABSENT"
  ).length;
  const onTime = filteredRows.filter(
    (r) =>
      r.actualCheckInAt &&
      (r.lateMinutes ?? 0) === 0 &&
      r.attendanceStatusCode?.toUpperCase() !== "LATE"
  ).length;

  // _OLD: Insights block intentionally removed for compact layout.

  const chartData = useMemo(() => {
    const byDate = new Map<string, { date: string; onTime: number; late: number; absent: number }>();
    filteredRows.forEach((r) => {
      const entry = byDate.get(r.workDate) ?? { date: r.workDate, onTime: 0, late: 0, absent: 0 };
      if (r.attendanceStatusCode?.toUpperCase() === "ABSENT") entry.absent += 1;
      else if (r.lateMinutes > 0 || r.attendanceStatusCode?.toUpperCase() === "LATE")
        entry.late += 1;
      else if (r.actualCheckInAt) entry.onTime += 1;
      byDate.set(r.workDate, entry);
    });
    return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredRows]);

  const staffOptions = useMemo(
    () =>
      [{ value: "all", label: t("attendanceTab.allStaff") }].concat(
        staffSummary.map((s) => ({ value: String(s.staffId), label: s.staffName }))
      ),
    [staffSummary, t]
  );

  const topAbsentStaff = useMemo(
    () =>
      [...filteredStaffSummary].sort((a, b) => b.absent - a.absent).slice(0, 3).filter((s) => s.absent > 0),
    [filteredStaffSummary]
  );
  const topLateStaff = useMemo(
    () =>
      [...filteredStaffSummary].sort((a, b) => b.late - a.late).slice(0, 3).filter((s) => s.late > 0),
    [filteredStaffSummary]
  );

  const statusCards = [
    {
      key: "on-time",
      label: t("attendanceTab.statusCards.onTime"),
      value: onTime,
      hint: pct(onTime, total),
      border: "border-blue-200 bg-blue-50",
      text: "text-blue-700",
    },
    {
      key: "late",
      label: t("attendanceTab.statusCards.late"),
      value: late,
      hint: pct(late, total),
      border: "border-amber-200 bg-amber-50",
      text: "text-amber-700",
    },
    {
      key: "absent",
      label: t("attendanceTab.statusCards.absent"),
      value: absent,
      hint: pct(absent, total),
      border: "border-red-200 bg-red-50",
      text: "text-red-700",
    },
    {
      key: "present",
      label: t("attendanceTab.statusCards.present"),
      value: present,
      hint: pct(present, total),
      border: "border-emerald-200 bg-emerald-50",
      text: "text-emerald-700",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#D5BA98]/60 bg-white p-2.5 shadow-sm">
        <div className="space-y-2.5">
          <div className="rounded-lg border border-[#D5BA98]/40 bg-[#FDFBF9] p-2">
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_190px_auto] gap-2 items-end">
              <ALInput
                value={staffQuery}
                onChange={(e) => {
                  setStaffQuery(e.target.value);
                  setPage(1);
                }}
                placeholder={t("attendanceTab.searchPlaceholder")}
                inputSize="sm"
                wrapperClassName="w-full"
              />
              <ALCombobox
                options={staffOptions}
                value={selectedStaffId}
                onChange={(val) => {
                  setSelectedStaffId(String(val || "all"));
                  setPage(1);
                }}
                placeholder={t("attendanceTab.filterByStaff")}
                inputSize="sm"
                wrapperClassName="w-full"
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs font-medium text-[#1A3A52]/60 hover:text-[#1A3A52] hover:bg-white"
                onClick={() => {
                  setStaffQuery("");
                  setSelectedStaffId("all");
                  setPage(1);
                }}
                disabled={!staffQuery && selectedStaffId === "all"}
              >
                {t("attendanceTab.clearSearch")}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-[#D5BA98]/50 bg-[#FDFBF9] px-2.5 py-1.5">
              <p className="text-[10px] uppercase tracking-wide text-[#1A3A52]/55">{t("attendanceTab.kpi.totalAssignments")}</p>
              <p className="text-base font-semibold text-[#1A3A52] leading-none mt-0.5 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> {total}
              </p>
            </div>
            <div className="rounded-lg border border-[#D5BA98]/50 bg-[#FDFBF9] px-2.5 py-1.5">
              <p className="text-[10px] uppercase tracking-wide text-[#1A3A52]/55">{t("attendanceTab.kpi.checkInRate")}</p>
              <p className="text-base font-semibold text-[#1A3A52] leading-none mt-0.5">{pct(present, total)}</p>
            </div>
            <div className="rounded-lg border border-[#D5BA98]/50 bg-[#FDFBF9] px-2.5 py-1.5">
              <p className="text-[10px] uppercase tracking-wide text-[#1A3A52]/55">{t("attendanceTab.kpi.lateArrivals")}</p>
              <p className="text-base font-semibold text-amber-700 leading-none mt-0.5">{late}</p>
            </div>
            <div className="rounded-lg border border-[#D5BA98]/50 bg-[#FDFBF9] px-2.5 py-1.5">
              <p className="text-[10px] uppercase tracking-wide text-[#1A3A52]/55">{t("attendanceTab.kpi.absences")}</p>
              <p className="text-base font-semibold text-red-700 leading-none mt-0.5">{absent}</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={summaryTab} onValueChange={setSummaryTab}>
        <TabsList variant={"line"} className={INNER_TAB_LIST_CLASS}>
          <TabsTrigger value="overview" className={INNER_TAB_TRIGGER_CLASS}>
            {t("attendanceTab.inner.overview")}
          </TabsTrigger>
          <TabsTrigger value="staffSummary" className={INNER_TAB_TRIGGER_CLASS}>
            {t("attendanceTab.inner.staffSummary")}
          </TabsTrigger>
          <TabsTrigger value="details" className={INNER_TAB_TRIGGER_CLASS}>
            {t("attendanceTab.inner.details")}{total > 0 && <span className="ml-1 text-[10px] opacity-50">({total})</span>}
          </TabsTrigger>
        </TabsList>

        {/* ── Overview ── */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {statusCards.map((s) => (
              <Card key={s.key} className={`border ${s.border} py-2.5 shadow-sm`}>
                <CardContent className="px-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#1A3A52]/55">
                    {s.label}
                  </p>
                  <p className={`mt-1 text-2xl font-semibold ${s.text}`}>{s.value}</p>
                  <p className="text-[10px] text-[#1A3A52]/45 mt-0.5">{s.hint} {t("attendanceTab.recordsOf")}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Daily chart */}
          <Card className="border border-[#D5BA98]/60 bg-white shadow-sm overflow-hidden">
            <CardHeader className="bg-[#D5BA98]/10 py-3 border-b border-slate-100">
              <CardTitle className="text-sm font-semibold text-[#1A3A52]">
                {t("attendanceTab.chart.dailyBreakdown")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-5">
              <div className="h-64 w-full">
                {chartData.length === 0 ? (
                  <TableState loading={loading} />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        tickMargin={8}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        allowDecimals={false}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(26,58,82,0.04)" }}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid #E2E8F0",
                          fontSize: "12px",
                        }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                      <Bar dataKey="onTime" name={t("attendanceTab.chart.onTime")} stackId="a" fill="#2563eb" radius={[0, 0, 4, 4]} />
                      <Bar dataKey="late" name={t("attendanceTab.chart.late")} stackId="a" fill="#d97706" />
                      <Bar dataKey="absent" name={t("attendanceTab.chart.absent")} stackId="a" fill="#dc2626" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top offenders */}
          {(topAbsentStaff.length > 0 || topLateStaff.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {topAbsentStaff.length > 0 && (
                <Card className="border-red-100 bg-white shadow-sm">
                  <CardHeader className="py-2.5 px-4 border-b border-slate-100">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-red-700">
                      {t("attendanceTab.topAbsences")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 py-3 space-y-2">
                    {topAbsentStaff.map((s) => (
                      <div
                        key={s.staffId}
                        className="flex items-center justify-between text-sm cursor-pointer group"
                        onClick={() => handleDrillDown(s.staffId)}
                      >
                        <span className="text-[#1A3A52] truncate group-hover:underline group-hover:text-red-600 transition-colors">
                          {s.staffName}
                        </span>
                        <Badge
                          variant="outline"
                          className="border-red-600 bg-red-600 text-white ml-2 shrink-0"
                        >
                          {s.absent}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
              {topLateStaff.length > 0 && (
                <Card className="border-amber-100 bg-white shadow-sm">
                  <CardHeader className="py-2.5 px-4 border-b border-slate-100">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                      {t("attendanceTab.topLate")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 py-3 space-y-2">
                    {topLateStaff.map((s) => (
                      <div
                        key={s.staffId}
                        className="flex items-center justify-between text-sm cursor-pointer group"
                        onClick={() => handleDrillDown(s.staffId)}
                      >
                        <span className="text-[#1A3A52] truncate group-hover:underline group-hover:text-amber-600 transition-colors">
                          {s.staffName}
                        </span>
                        <Badge
                          variant="outline"
                          className="border-amber-600 bg-amber-600 text-white ml-2 shrink-0"
                        >
                          {s.late}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        {/* ── Staff Summary ── */}
        <TabsContent value="staffSummary" className="mt-4">
          {filteredStaffSummary.length === 0 ? (
            <TableState loading={loading} />
          ) : (
            <div className="space-y-4">
              {/* Card previews (up to 6) */}
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                {filteredStaffSummary.slice(0, 6).map((s) => (
                  <div
                    key={s.staffId}
                    className="rounded-xl border border border-[#D5BA98]/60 bg-white p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => handleDrillDown(s.staffId)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-[#1A3A52] truncate group-hover:text-blue-700 group-hover:underline">
                        {s.staffName}
                      </p>
                      <span className="text-[10px] text-[#1A3A52]/45 shrink-0 ml-1">
                        {t("attendanceTab.scorePrefix")} <ReliabilityBadge score={s.reliabilityScore} />
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-1.5">
                      <div
                        className={`h-full rounded-full transition-all ${
                          s.total > 0 && Math.round((s.present / s.total) * 100) >= 90
                            ? "bg-emerald-500"
                            : s.total > 0 && Math.round((s.present / s.total) * 100) >= 70
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                        style={{
                          width: `${s.total > 0 ? Math.round((s.present / s.total) * 100) : 0}%`,
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-[#1A3A52]/50 mb-2">
                      {t("attendanceTab.kpi.checkInRate")}: {pct(s.present, s.total)}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-[10px] border-slate-700 bg-slate-700 text-white">
                        {t("attendanceTab.badges.total", { value: s.total })}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] border-emerald-600 bg-emerald-600 text-white">
                        {t("attendanceTab.badges.present", { value: s.present })}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] border-blue-600 bg-blue-600 text-white">
                        {t("attendanceTab.badges.onTime", { value: s.onTime })}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] border-amber-600 bg-amber-600 text-white">
                        {t("attendanceTab.badges.late", { value: s.late })}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] border-red-600 bg-red-600 text-white">
                        {t("attendanceTab.badges.absent", { value: s.absent })}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {/* Full table */}
              <div className="overflow-x-auto rounded-xl border border-[#D5BA98]/60 bg-white shadow-sm">
                <table className="w-full text-sm min-w-[580px]">
                  <thead className="bg-[#1A3A52]/5">
                    <tr>
                      {[
                        t("attendanceTab.summaryTable.staff"),
                        t("attendanceTab.summaryTable.total"),
                        t("attendanceTab.summaryTable.present"),
                        t("attendanceTab.summaryTable.onTime"),
                        t("attendanceTab.summaryTable.late"),
                        t("attendanceTab.summaryTable.absent"),
                        t("attendanceTab.summaryTable.checkInRate"),
                        t("attendanceTab.summaryTable.reliability"),
                      ].map((h) => (
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
                    {filteredStaffSummary.map((s) => (
                      <tr
                        key={s.staffId}
                        className="hover:bg-[#1A3A52]/4 cursor-pointer group transition-colors"
                        onClick={() => handleDrillDown(s.staffId)}
                      >
                        <td className="px-4 py-3 font-medium text-[#1A3A52] group-hover:underline group-hover:text-blue-700 whitespace-nowrap">
                          {s.staffName}
                        </td>
                        <td className="px-4 py-3 text-[#1A3A52]">{s.total}</td>
                        <td className="px-4 py-3 font-medium text-emerald-700">{s.present}</td>
                        <td className="px-4 py-3 font-medium text-blue-700">{s.onTime}</td>
                        <td className="px-4 py-3 font-medium text-amber-700">{s.late}</td>
                        <td className="px-4 py-3 font-medium text-red-700">{s.absent}</td>
                        <td className="px-4 py-3 text-[#1A3A52]">{pct(s.present, s.total)}</td>
                        <td className="px-4 py-3">
                          <ReliabilityBadge score={s.reliabilityScore} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── Details ── */}
        <TabsContent value="details" className="mt-4">
          {loading || filteredRows.length === 0 ? (
            <TableState loading={loading} />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#D5BA98]/60 bg-white shadow-sm">
              <table className="w-full text-sm min-w-[720px]">
                <thead className="bg-[#1A3A52]/5">
                  <tr>
                    {[
                      t("attendanceTab.detailTable.date"),
                      t("attendanceTab.detailTable.staff"),
                      t("attendanceTab.detailTable.shift"),
                      t("attendanceTab.detailTable.planned"),
                      t("attendanceTab.detailTable.status"),
                      t("attendanceTab.detailTable.checkIn"),
                      t("attendanceTab.detailTable.checkOut"),
                      t("attendanceTab.detailTable.late"),
                      t("attendanceTab.detailTable.earlyLeave"),
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#1A3A52]/65 whitespace-nowrap"
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
                        key={r.shiftAssignmentId ?? i}
                        className={`transition-colors hover:bg-[#1A3A52]/4 ${
                          r.isManualAdjustment ? "bg-blue-50/40" : ""
                        }`}
                      >
                        <td className="px-3 py-2.5 text-[#1A3A52] whitespace-nowrap text-xs">
                          {r.workDate}
                        </td>
                        <td className="px-3 py-2.5 font-medium text-[#1A3A52] whitespace-nowrap">
                          {r.staffName}
                          {r.isManualAdjustment && (
                            <span className="ml-1 text-[9px] text-blue-500 font-bold" title={t("attendanceTab.manualAdjusted")}>
                              ✦
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-[#1A3A52]/60 text-xs">{r.templateName}</td>
                        <td className="px-3 py-2.5 text-[#1A3A52]/60 text-xs whitespace-nowrap">
                          {formatTime(r.plannedStartAt)} – {formatTime(r.plannedEndAt)}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-semibold ${attendanceBadgeClass(r.attendanceStatusCode)}`}
                          >
                            {displayStatusName(r.attendanceStatusCode)}
                          </Badge>
                        </td>
                        <td className="px-3 py-2.5 text-[#1A3A52] whitespace-nowrap text-xs">
                          {formatTime(r.actualCheckInAt)}
                        </td>
                        <td className="px-3 py-2.5 text-[#1A3A52] whitespace-nowrap text-xs">
                          {formatTime(r.actualCheckOutAt)}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          {r.lateMinutes > 0 ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] border-amber-600 bg-amber-600 text-white"
                            >
                              {r.lateMinutes}m
                            </Badge>
                          ) : (
                            <span className="text-[#1A3A52]/30 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          {r.earlyLeaveMinutes > 0 ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] border-blue-600 bg-blue-600 text-white"
                            >
                              {r.earlyLeaveMinutes}m
                            </Badge>
                          ) : (
                            <span className="text-[#1A3A52]/30 text-xs">—</span>
                          )}
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
