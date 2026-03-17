"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Users, Clock, AlertTriangle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  useAttendanceReportQuery,
  useWorkedHoursReportQuery,
  useExceptionsReportQuery,
} from "../hooks/use-shift-queries";
import { thisMonthRange, exportToCsv, TAB_TRIGGER_CLASS, type FiltersState } from "./components/report-shared";
import { ReportHeader } from "./components/report-header";
import { ReportHealthBanner } from "./components/report-health-banner";
import { AttendanceTab } from "./components/attendance-tab";
import { WorkedHoursTab } from "./components/worked-hours-tab";
import { ExceptionsTab } from "./components/exceptions-tab";

export function ShiftReports() {
  const t = useTranslations("ShiftManagement.Reports");
  const defaultRange = thisMonthRange();
  const [filters, setFilters] = useState<FiltersState>({
    fromDate: defaultRange.from,
    toDate: defaultRange.to,
  });
  const [activeTab, setActiveTab] = useState("attendance");

  const enabled = !!filters.fromDate && !!filters.toDate;

  // Fetch all 3 reports eagerly so the health banner always has data
  const { data: attendancePage, isLoading: attLoading, refetch: attRefetch } =
    useAttendanceReportQuery(
      enabled ? { fromDate: filters.fromDate, toDate: filters.toDate, pageSize: 500 } : {}
    );

  const { data: workedHours = [], isLoading: whLoading, refetch: whRefetch } =
    useWorkedHoursReportQuery(
      { fromDate: filters.fromDate, toDate: filters.toDate },
      enabled
    );

  const { data: exceptions = [], isLoading: excLoading, refetch: excRefetch } =
    useExceptionsReportQuery(
      { fromDate: filters.fromDate, toDate: filters.toDate },
      enabled
    );

  const attendanceRows = useMemo(() => attendancePage?.pageData ?? [], [attendancePage]);

  const isLoading =
    activeTab === "attendance" ? attLoading :
    activeTab === "workedHours" ? whLoading :
    excLoading;

  function handleRefetch() {
    if (activeTab === "attendance") attRefetch();
    else if (activeTab === "workedHours") whRefetch();
    else excRefetch();
  }

  function handleExportCsv() {
    if (activeTab === "attendance") {
      exportToCsv(
        attendanceRows.map((r) => ({
          Date: r.workDate,
          StaffId: r.staffId,
          StaffName: r.staffName,
          Template: r.templateName,
          Status: r.attendanceStatusCode,
          PlannedStart: r.plannedStartAt,
          PlannedEnd: r.plannedEndAt,
          CheckIn: r.actualCheckInAt ?? "",
          CheckOut: r.actualCheckOutAt ?? "",
          LateMinutes: r.lateMinutes,
          EarlyLeaveMinutes: r.earlyLeaveMinutes,
          ManualAdjustment: r.isManualAdjustment,
        })),
        `attendance-${filters.fromDate}-to-${filters.toDate}.csv`
      );
    } else if (activeTab === "workedHours") {
      exportToCsv(
        workedHours.map((r) => ({
          StaffId: r.staffId,
          StaffName: r.staffName,
          ScheduledMinutes: r.scheduledMinutes,
          WorkedMinutes: r.workedMinutes,
          VarianceMinutes: r.varianceMinutes,
          EfficiencyPct:
            r.scheduledMinutes > 0
              ? Math.round((r.workedMinutes / r.scheduledMinutes) * 100)
              : 0,
          IncompleteRecords: r.incompleteRecords,
        })),
        `worked-hours-${filters.fromDate}-to-${filters.toDate}.csv`
      );
    } else {
      exportToCsv(
        exceptions.map((r) => ({
          Date: r.workDate,
          StaffId: r.staffId,
          StaffName: r.staffName,
          Template: r.templateName,
          ExceptionType: r.exceptionType,
          MinutesAffected: r.minutesAffected,
          IsManualAdjustment: r.isManualAdjustment,
          Reviewer: r.reviewerName ?? "",
        })),
        `exceptions-${filters.fromDate}-to-${filters.toDate}.csv`
      );
    }
  }

  const exceptionCount = exceptions.length;
  const attendanceAbsentRate =
    attendanceRows.length > 0
      ? Math.round(
          (attendanceRows.filter((r) => r.attendanceStatusCode === "ABSENT").length /
            attendanceRows.length) *
            100
        )
      : 0;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="shrink-0 space-y-4 pb-4">
        <ReportHeader
          filters={filters}
          isLoading={isLoading}
          onChange={setFilters}
          onRefetch={handleRefetch}
          onExportCsv={handleExportCsv}
        />

        <ReportHealthBanner
          attendanceRows={attendanceRows}
          workedHoursRows={workedHours}
          exceptionRows={exceptions}
        />
      </div>

      <div className="flex flex-col flex-1 min-h-0">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col min-w-0 bg-white rounded-xl border border-[#D5BA98]/30 shadow-sm overflow-hidden"
        >
          <TabsList className="flex flex-wrap items-center justify-start border-b border-[#D5BA98]/30 shrink-0 p-0 bg-[#FDFBF9] w-full h-auto rounded-none">
            <TabsTrigger
              value="attendance"
              className={`${TAB_TRIGGER_CLASS} flex items-center gap-1.5`}
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>{t("tabs.attendance")}</span>
              {attendanceAbsentRate >= 15 && (
                <span
                  className="inline-flex h-2 w-2 rounded-full bg-red-500 shrink-0"
                  title={t("highAbsenceRate")}
                />
              )}
            </TabsTrigger>
            <TabsTrigger
              value="workedHours"
              className={`${TAB_TRIGGER_CLASS} flex items-center gap-1.5`}
            >
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>{t("tabs.workedHours")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="exceptions"
              className={`${TAB_TRIGGER_CLASS} flex items-center gap-1.5`}
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{t("tabs.exceptions")}</span>
              {exceptionCount > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold min-w-[16px] h-4 px-1 leading-none shrink-0">
                  {exceptionCount > 9 ? "9+" : exceptionCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            <TabsContent value="attendance" className="m-0 border-none p-0 outline-none">
              <AttendanceTab rows={attendanceRows} loading={attLoading} />
            </TabsContent>

            <TabsContent value="workedHours" className="m-0 border-none p-0 outline-none">
              <WorkedHoursTab rows={workedHours} loading={whLoading} />
            </TabsContent>

            <TabsContent value="exceptions" className="m-0 border-none p-0 outline-none">
              <ExceptionsTab rows={exceptions} loading={excLoading} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
