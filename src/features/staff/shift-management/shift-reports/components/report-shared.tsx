"use client";

import { AlertTriangle, CheckCircle2, Clock, TrendingDown, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { dateUtils } from "@/lib/date-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ALCard } from "@/components/ui/al-card";
import type { AttendanceReportRowDto } from "../../types/shift-management.types";

// ── Constants ──────────────────────────────────────────────────────────────────

export const TAB_TRIGGER_CLASS =
    "h-auto py-1 px-2.5 sm:py-1.5 sm:px-3 mb-1 text-xs sm:text-sm text-[#1A3A52]/70 font-medium transition-all data-[state=active]:!bg-[#1A3A52] data-[state=active]:!text-white data-[state=active]:!shadow-sm rounded-lg";

export const INNER_TAB_LIST_CLASS =
    "flex items-center justify-start gap-6 border-b border-[#D5BA98]/40 bg-transparent p-0 w-full rounded-none h-auto";

export const INNER_TAB_TRIGGER_CLASS =
    "h-auto py-2.5 px-1 bg-transparent text-[#1A3A52]/60 font-medium transition-all hover:text-[#1A3A52] data-[state=active]:!bg-transparent data-[state=active]:!text-[#1A3A52] data-[state=active]:border-b-2 data-[state=active]:border-[#1A3A52] data-[state=active]:!shadow-none rounded-none border-b-2 border-transparent -mb-px";


// ── Types ──────────────────────────────────────────────────────────────────────

export interface FiltersState {
    fromDate: string;
    toDate: string;
}

export interface StaffAttendanceSummary {
    staffId: number;
    staffName: string;
    total: number;
    present: number;
    late: number;
    absent: number;
    onTime: number;
    reliabilityScore: number;
}

// ── Helper Functions ───────────────────────────────────────────────────────────

export function minToHM(min: number) {
    if (!min) return "0h 0m";
    return `${Math.floor(min / 60)}h ${min % 60}m`;
}

export function pct(n: number, d: number) {
    if (!d) return "—";
    return `${Math.round((n / d) * 100)}%`;
}

export function thisMonthRange() {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
    return { from, to };
}

export function formatTime(isoString: string | null | undefined): string {
    if (!isoString) return "—";
    try {
        return dateUtils.formatLocal(isoString, "HH:mm");
    } catch {
        return "—";
    }
}

export function displayStatusName(statusCode: string, t?: (key: string) => string): string {
    const code = statusCode?.toUpperCase();
    if (t) return t(code);
    const map: Record<string, string> = {
        ABSENT: "Absent",
        LATE: "Late",
        ACTIVE: "Active",
        ON_DUTY: "On Duty",
        COMPLETED: "Completed",
        SCHEDULED: "Scheduled",
        CHECKED_IN: "Checked In",
    };
    return map[code] ?? statusCode;
}

export function displayExceptionName(type: string, t?: (key: string) => string): string {
    const code = type?.toUpperCase();
    if (t) return t(code);
    const map: Record<string, string> = {
        LATE: "Late Arrival",
        ABSENT: "Absent",
        EARLY_LEAVE: "Early Leave",
    };
    return map[code] ?? type;
}

export function attendanceBadgeClass(statusCode: string) {
    const code = statusCode?.toUpperCase();
    if (code === "ABSENT") return "border-red-600 bg-red-600 text-white";
    if (code === "LATE") return "border-amber-600 bg-amber-600 text-white";
    if (code === "ACTIVE" || code === "ON_DUTY") return "border-blue-600 bg-blue-600 text-white";
    if (code === "COMPLETED") return "border-emerald-600 bg-emerald-600 text-white";
    return "border-slate-700 bg-slate-700 text-white";
}

export function exceptionBadgeClass(exceptionType: string) {
    const code = exceptionType?.toUpperCase();
    if (code === "ABSENT") return "border-red-600 bg-red-600 text-white";
    if (code === "LATE") return "border-amber-600 bg-amber-600 text-white";
    if (code === "EARLY_LEAVE") return "border-blue-600 bg-blue-600 text-white";
    return "border-slate-700 bg-slate-700 text-white";
}

export function buildStaffSummary(rows: AttendanceReportRowDto[]): StaffAttendanceSummary[] {
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
            reliabilityScore: 0,
        };
        existing.total += 1;
        if (r.actualCheckInAt) existing.present += 1;
        if (r.attendanceStatusCode?.toUpperCase() === "ABSENT") existing.absent += 1;
        if (r.lateMinutes > 0 || r.attendanceStatusCode?.toUpperCase() === "LATE") existing.late += 1;
        if (
            r.actualCheckInAt &&
            (r.lateMinutes ?? 0) === 0 &&
            r.attendanceStatusCode?.toUpperCase() !== "LATE"
        ) {
            existing.onTime += 1;
        }
        byStaff.set(r.staffId, existing);
    });

    const result = [...byStaff.values()].sort(
        (a, b) => b.total - a.total || a.staffName.localeCompare(b.staffName)
    );

    // Compute reliability score: on_time rate minus absence/late penalties
    result.forEach((s) => {
        const baseScore = s.total > 0 ? (s.onTime / s.total) * 100 : 0;
        const absentPenalty = s.total > 0 ? (s.absent / s.total) * 20 : 0;
        const latePenalty = s.total > 0 ? (s.late / s.total) * 5 : 0;
        s.reliabilityScore = Math.max(0, Math.round(baseScore - absentPenalty - latePenalty));
    });

    return result;
}

export function exportToCsv(data: unknown[], filename: string) {
    if (!data || data.length === 0) return;
    const header = Object.keys(data[0] as object).join(",");
    const lines = data.map((r) =>
        Object.values(r as object)
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(",")
    );
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ── Shared UI Components ───────────────────────────────────────────────────────

interface KpiProps {
    label: string;
    value: string | number;
    sub?: string;
    icon?: React.ReactNode;
    trend?: "up" | "down" | "neutral";
}

export function Kpi({ label, value, sub, icon, trend }: KpiProps) {
    return (
        <ALCard hoverable className="py-2.5">
            <CardContent className="px-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <div className=" flex text-xl font-semibold leading-none text-[#1A3A52] truncate">
                            <p className="pr-2">{value}</p>
                            {trend && (
                                <div className="flex items-center gap-1">
                                    {trend === "up" ? (
                                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                                    ) : trend === "down" ? (
                                        <TrendingDown className="w-3 h-3 text-red-500" />
                                    ) : null}
                                </div>
                            )}</div>
                        {sub && <p className="mt-1 text-xs text-[#1A3A52]/70">{sub}</p>}
                        <p className="mt-1 text-[11px] text-[#1A3A52]/65 uppercase tracking-wide font-medium">{label}</p>
                    </div>
                    {icon && <div className="ml-2 shrink-0 text-[#1A3A52]/30">{icon}</div>}
                </div>

            </CardContent>
        </ALCard>
    );
}

export function TableState({ loading }: { loading: boolean }) {
    const t = useTranslations("shift.reports.shared");
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-sm text-[#1A3A52]/70">
            {loading ? (
                <>
                    <div className="w-6 h-6 border-2 border-[#1A3A52]/30 border-t-[#1A3A52] rounded-full animate-spin" />
                    <span>{t("loading")}</span>
                </>
            ) : (
                <>
                    <AlertTriangle className="w-8 h-8 text-[#1A3A52]/25" />
                    <span>{t("empty")}</span>
                </>
            )}
        </div>
    );
}

export function InsightBanner({
    message,
    type,
}: {
    message: string;
    type: "warning" | "success" | "info";
}) {
    const styles = {
        warning: "bg-amber-50 border-amber-200 text-amber-800",
        success: "bg-emerald-50 border-emerald-200 text-emerald-800",
        info: "bg-blue-50 border-blue-200 text-blue-800",
    };
    const icons = {
        warning: <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />,
        success: <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />,
        info: <Clock className="w-4 h-4 shrink-0 mt-0.5" />,
    };
    return (
        <div
            className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium ${styles[type]}`}
        >
            {icons[type]}
            <span>{message}</span>
        </div>
    );
}

export function PaginationControls({
    page,
    pageSize,
    total,
    setPage,
    setPageSize,
}: {
    page: number;
    pageSize: number;
    total: number;
    setPage: (p: number) => void;
    setPageSize: (s: number) => void;
}) {
    const t = useTranslations("shift.reports.shared");
    const totalPages = Math.ceil(total / pageSize);
    if (total === 0) return null;
    return (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2 text-xs text-[#1A3A52]/60">
                <span>{t("show")}</span>
                <select
                    value={pageSize}
                    onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setPage(1);
                    }}
                    className="h-7 rounded border border-[#D5BA98]/60 bg-white px-1 text-xs outline-none"
                >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
                <span>{t("records")}</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
                <span className="text-[#1A3A52]/60">
                    {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
                </span>
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-[10px]"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                    >
                        {t("prev")}
                    </Button>
                    <span className="mx-2 font-medium text-[#1A3A52]">
                        {page} / {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-[10px]"
                        disabled={page >= totalPages}
                        onClick={() => setPage(page + 1)}
                    >
                        {t("next")}
                    </Button>
                </div>
            </div>
        </div>
    );
}
