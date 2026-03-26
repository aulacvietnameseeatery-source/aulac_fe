"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type { WorkedHoursReportRowDto } from "../../types/shift-management.types";
import {
  INNER_TAB_LIST_CLASS,
  INNER_TAB_TRIGGER_CLASS,
  Kpi,
  TableState,
  InsightBanner,
  PaginationControls,
  minToHM,
} from "./report-shared";

interface Props {
  rows: WorkedHoursReportRowDto[];
  loading: boolean;
}

function efficiencyColor(pctVal: number) {
  if (pctVal >= 90) return "text-emerald-700";
  if (pctVal >= 70) return "text-amber-700";
  return "text-red-700";
}

export function WorkedHoursTab({ rows, loading }: Props) {
  const t = useTranslations("shift.reports");
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

  const totalSched = filteredRows.reduce((s, r) => s + r.scheduledMinutes, 0);
  const totalWorked = filteredRows.reduce((s, r) => s + r.workedMinutes, 0);
  const totalVariance = filteredRows.reduce((s, r) => s + r.varianceMinutes, 0);
  const incompleteCount = filteredRows.filter((r) => r.incompleteRecords > 0).length;
  const overtimeCount = filteredRows.filter((r) => r.varianceMinutes > 30).length;

  const avgEfficiency =
    filteredRows.length > 0
      ? Math.round(
          filteredRows.reduce(
            (sum, r) =>
              sum + (r.scheduledMinutes > 0 ? (r.workedMinutes / r.scheduledMinutes) * 100 : 0),
            0
          ) / filteredRows.length
        )
      : 0;

  const chartData = useMemo(
    () =>
      [...filteredRows]
        .sort((a, b) => b.scheduledMinutes - a.scheduledMinutes)
        .slice(0, 15)
        .map((r) => ({
          name: r.staffName.split(" ")[0],
          scheduled: Math.round((r.scheduledMinutes / 60) * 10) / 10,
          worked: Math.round((r.workedMinutes / 60) * 10) / 10,
        })),
    [filteredRows]
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full max-w-sm">
          <input
            value={staffQuery}
            onChange={(e) => setStaffQuery(e.target.value)}
            placeholder={t("workedHoursTab.searchPlaceholder")}
            className="h-8 w-full rounded-lg border border-[#D5BA98]/60 bg-[#FDFBF9] px-3 text-sm text-[#1A3A52] placeholder:text-[#1A3A52]/40 focus:outline-none focus:ring-2 focus:ring-[#1A3A52]/20"
          />
        </div>
        {staffQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="text-[#1A3A52]/60 hover:text-[#1A3A52] hover:bg-transparent h-8 px-2 text-xs font-medium"
            onClick={() => setStaffQuery("")}
          >
            {t("workedHoursTab.clearSearch")}
          </Button>
        )}
      </div>

      {incompleteCount > 0 && (
        <InsightBanner
          type="warning"
          message={t("workedHoursTab.insightIncomplete", { count: incompleteCount })}
        />
      )}
      {totalVariance < -60 && (
        <InsightBanner
          type="info"
          message={t("workedHoursTab.insightUnderwork", { time: minToHM(Math.abs(totalVariance)) })}
        />
      )}
      {overtimeCount > 0 && (
        <InsightBanner
          type="info"
          message={t("workedHoursTab.insightOvertime", { count: overtimeCount })}
        />
      )}

      <Tabs value={innerTab} onValueChange={setInnerTab}>
        <TabsList variant={"line"} className={INNER_TAB_LIST_CLASS}>
          <TabsTrigger value="summary" className={INNER_TAB_TRIGGER_CLASS}>
            {t("workedHoursTab.inner.summary")}
          </TabsTrigger>
          <TabsTrigger value="details" className={INNER_TAB_TRIGGER_CLASS}>
            {t("workedHoursTab.inner.details")}
          </TabsTrigger>
        </TabsList>

        {/* ── Summary ── */}
        <TabsContent value="summary" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi label={t("workedHoursTab.kpi.totalScheduled")} value={minToHM(totalSched)} />
            <Kpi label={t("workedHoursTab.kpi.totalWorked")} value={minToHM(totalWorked)} />
            <Kpi
              label={t("workedHoursTab.kpi.variance")}
              value={`${totalVariance >= 0 ? "+" : ""}${minToHM(Math.abs(totalVariance))}`}
              sub={totalVariance < 0 ? t("workedHoursTab.underSchedule") : t("workedHoursTab.overSchedule")}
              trend={totalVariance < 0 ? "down" : "up"}
            />
            <Kpi
              label={t("workedHoursTab.kpi.avgEfficiency")}
              value={`${avgEfficiency}%`}
              sub={`${incompleteCount} ${t("workedHoursTab.kpi.incomplete")}`}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="border-blue-200 bg-blue-50 py-2.5 shadow-sm">
              <CardContent className="px-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-700/70">
                  {t("workedHoursTab.cards.staffTracked")}
                </p>
                <p className="mt-1 text-xl font-semibold text-blue-700">{filteredRows.length}</p>
              </CardContent>
            </Card>
            <Card className="border-emerald-200 bg-emerald-50 py-2.5 shadow-sm">
              <CardContent className="px-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700/70">
                  {t("workedHoursTab.cards.totalWorked")}
                </p>
                <p className="mt-1 text-xl font-semibold text-emerald-700">
                  {minToHM(totalWorked)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-amber-200 bg-amber-50 py-2.5 shadow-sm">
              <CardContent className="px-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700/70">
                  {t("workedHoursTab.cards.scheduled")}
                </p>
                <p className="mt-1 text-xl font-semibold text-amber-700">{minToHM(totalSched)}</p>
              </CardContent>
            </Card>
            <Card
              className={`py-2.5 shadow-sm ${
                overtimeCount > 0 ? "border-blue-200 bg-blue-50" : "border border-[#D5BA98]/60 bg-slate-50"
              }`}
            >
              <CardContent className="px-3">
                <p
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    overtimeCount > 0 ? "text-blue-700/70" : "text-[#1A3A52]/50"
                  }`}
                >
                  {t("workedHoursTab.cards.overtime")}
                </p>
                <p
                  className={`mt-1 text-xl font-semibold ${
                    overtimeCount > 0 ? "text-blue-700" : "text-[#1A3A52]/70"
                  }`}
                >
                  {overtimeCount}
                </p>
              </CardContent>
            </Card>
          </div>

          {chartData.length > 0 && (
            <Card className="border border-[#D5BA98]/60 bg-white shadow-sm overflow-hidden">
              <CardHeader className="bg-[#D5BA98]/10 py-3 border-b border-slate-100">
                <CardTitle className="text-sm font-semibold text-[#1A3A52]">
                {t("workedHoursTab.chartTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-5">
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: "#64748b" }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        unit="h"
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(26,58,82,0.04)" }}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid #E2E8F0",
                          fontSize: "12px",
                        }}
                        formatter={(val, name) => [`${val}h`, name]}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                      <Bar dataKey="scheduled" name={t("workedHoursTab.chartScheduled")} fill="#94a3b8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="worked" name={t("workedHoursTab.chartWorked")} fill="#1A3A52" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Staff Details table ── */}
        <TabsContent value="details" className="mt-4">
          {loading || filteredRows.length === 0 ? (
            <TableState loading={loading} />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#D5BA98]/60 bg-white shadow-sm">
              <table className="w-full text-sm min-w-[560px]">
                <thead className="bg-[#1A3A52]/5">
                  <tr>
                    {[t("workedHoursTab.table.staff"), t("workedHoursTab.table.scheduled"), t("workedHoursTab.table.worked"), t("workedHoursTab.table.variance"), t("workedHoursTab.table.efficiency"), t("workedHoursTab.table.overtime"), t("workedHoursTab.table.incomplete")].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#1A3A52]/65 whitespace-nowrap"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRows
                    .slice((page - 1) * pageSize, page * pageSize)
                    .map((r) => {
                      const eff =
                        r.scheduledMinutes > 0
                          ? Math.round((r.workedMinutes / r.scheduledMinutes) * 100)
                          : 0;
                      const isOvertime = r.varianceMinutes > 30;
                      return (
                        <tr
                          key={r.staffId}
                          className="hover:bg-[#1A3A52]/4 transition-colors"
                        >
                          <td className="px-4 py-2.5 font-medium text-[#1A3A52] whitespace-nowrap">
                            {r.staffName}
                          </td>
                          <td className="px-4 py-2.5 text-[#1A3A52]">
                            {minToHM(r.scheduledMinutes)}
                          </td>
                          <td className="px-4 py-2.5 text-[#1A3A52]">
                            {minToHM(r.workedMinutes)}
                          </td>
                          <td
                            className={`px-4 py-2.5 font-semibold ${
                              r.varianceMinutes < 0 ? "text-red-700" : "text-emerald-700"
                            }`}
                          >
                            {r.varianceMinutes >= 0 ? "+" : ""}
                            {minToHM(Math.abs(r.varianceMinutes))}
                          </td>
                          <td className={`px-4 py-2.5 font-semibold ${efficiencyColor(eff)}`}>
                            {eff}%
                          </td>
                          <td className="px-4 py-2.5">
                            {isOvertime ? (
                              <Badge
                                variant="outline"
                                className="text-[10px] border-blue-600 bg-blue-600 text-white"
                              >
                                +{minToHM(r.varianceMinutes)}
                              </Badge>
                            ) : (
                              <span className="text-[#1A3A52]/30 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5">
                            {r.incompleteRecords > 0 ? (
                              <Badge
                                variant="outline"
                                className="text-[10px] border-amber-600 bg-amber-600 text-white"
                              >
                                {r.incompleteRecords}
                              </Badge>
                            ) : (
                              <span className="text-[#1A3A52]/30 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
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
