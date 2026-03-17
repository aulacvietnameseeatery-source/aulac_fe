"use client";

import { useTranslations } from "next-intl";
import { Users, Clock, AlertTriangle } from "lucide-react";
import type {
  AttendanceReportRowDto,
  WorkedHoursReportRowDto,
  AttendanceExceptionReportRowDto,
} from "../../types/shift-management.types";

interface Props {
  attendanceRows: AttendanceReportRowDto[];
  workedHoursRows: WorkedHoursReportRowDto[];
  exceptionRows: AttendanceExceptionReportRowDto[];
}

interface HealthMetric {
  label: string;
  value: string;
  sub: string;
  pctValue: number;
  valueClass: string;
  trackClass: string;
  icon: React.ReactNode;
}

export function ReportHealthBanner({ attendanceRows, workedHoursRows, exceptionRows }: Props) {
  const t = useTranslations("ShiftManagement.Reports");
  const total = attendanceRows.length;
  const present = attendanceRows.filter((r) => r.actualCheckInAt).length;
  const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

  const totalSched = workedHoursRows.reduce((s, r) => s + r.scheduledMinutes, 0);
  const totalWorked = workedHoursRows.reduce((s, r) => s + r.workedMinutes, 0);
  const hoursCompliance =
    totalSched > 0 ? Math.min(100, Math.round((totalWorked / totalSched) * 100)) : 0;

  const exceptionCount = exceptionRows.length;

  const metrics: HealthMetric[] = [
    {
      label: t("health.attendanceRate"),
      value: total > 0 ? `${attendanceRate}%` : "—",
      sub: total > 0 ? t("health.shiftsPresent", { present, total }) : t("health.noAttendanceData"),
      pctValue: attendanceRate,
      valueClass:
        attendanceRate >= 90
          ? "text-emerald-700"
          : attendanceRate >= 70
          ? "text-amber-700"
          : "text-red-700",
      trackClass:
        attendanceRate >= 90
          ? "bg-emerald-500"
          : attendanceRate >= 70
          ? "bg-amber-500"
          : "bg-red-500",
      icon: <Users className="w-4 h-4" />,
    },
    {
      label: t("health.hoursCompliance"),
      value: totalSched > 0 ? `${hoursCompliance}%` : "—",
      sub:
        totalSched > 0
          ? t("health.hoursWorked", { worked: Math.round(totalWorked / 60), scheduled: Math.round(totalSched / 60) })
          : t("health.noHoursData"),
      pctValue: hoursCompliance,
      valueClass:
        hoursCompliance >= 90
          ? "text-emerald-700"
          : hoursCompliance >= 70
          ? "text-amber-700"
          : "text-red-700",
      trackClass:
        hoursCompliance >= 90
          ? "bg-emerald-500"
          : hoursCompliance >= 70
          ? "bg-amber-500"
          : "bg-red-500",
      icon: <Clock className="w-4 h-4" />,
    },
    {
      label: t("health.exceptions"),
      value: String(exceptionCount),
      sub: t("health.issuesFlagged", { count: exceptionCount }),
      pctValue: Math.max(0, 100 - exceptionCount * 5),
      valueClass:
        exceptionCount === 0
          ? "text-emerald-700"
          : exceptionCount <= 5
          ? "text-amber-700"
          : "text-red-700",
      trackClass:
        exceptionCount === 0
          ? "bg-emerald-500"
          : exceptionCount <= 5
          ? "bg-amber-500"
          : "bg-red-500",
      icon: <AlertTriangle className="w-4 h-4" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="rounded-2xl border border border-[#D5BA98]/60 bg-white px-4 py-3 shadow-sm space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#1A3A52]/50">
              {m.label}
            </span>
            <span className={`${m.valueClass} opacity-60`}>{m.icon}</span>
          </div>
          <div>
            <span className={`text-3xl font-semibold leading-none ${m.valueClass}`}>
              {m.value}
            </span>
            <p className="text-xs text-[#1A3A52]/50 mt-1">{m.sub}</p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${m.trackClass}`}
              style={{ width: `${m.pctValue}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
