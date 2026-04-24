"use client";

import React, { useMemo, useCallback, useState } from "react";
import { BaseTable } from "@/components/ui/table/base-table";
import { TableColumn } from "@/types/table.types";
import { CalendarDays, ArrowRight } from "lucide-react";
import { ALTitleCard } from "@/components/ui/al-title-card";
import { useEarningReport } from "@/features/staff/report-management/earning/hooks/use-earning-report";
import { EarningFilter } from "@/features/staff/report-management/earning/components/earning-filter";
import { EarningTableItemDto } from "@/features/staff/report-management/earning/types/earning-types";
import { useTranslations } from "next-intl";

import { EarningDetailDrawer } from "@/features/staff/report-management/earning/components/earning-detail-drawer";

export default function EarningReportPage() {
    const t = useTranslations("reports.earning");
    const tCommon = useTranslations("reports.common");

    const {
        data,
        isLoading,
        totalCount,
        filters,
        onDataChange,
        refresh,
        applyDateFilter
    } = useEarningReport();

    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleViewDetail = (date: string) => {
        setSelectedDate(date);
        setIsDrawerOpen(true);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('de-CH', {
            style: 'currency',
            currency: 'CHF'
        }).format(value);
    };

    const columns: TableColumn[] = useMemo(
        () => [
            {
                field: "date",
                header: t("table.date"),
                width: "180px",
                cellRender: ({ value }: { value: any }) => (
                    <button
                        onClick={() => handleViewDetail(value)}
                        className="flex items-center gap-2 text-[#1A3A52] font-bold hover:text-[#C5A059] transition-all group"
                    >
                        <CalendarDays size={16} className="text-[#C5A059]" />
                        <span className="underline underline-offset-4 decoration-[#C5A059]/30 group-hover:decoration-[#C5A059]">
                            {value}
                        </span>
                    </button>
                ),
            },
            {
                field: "totalOrders",
                header: t("table.totalOrders"),
                width: "150px",
                align: "center" as const,
                cellRender: ({ value }: { value: any }) => (
                    <span className="font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                        {value}
                    </span>
                )
            },
            {
                field: "grossRevenue",
                header: t("table.grossRevenue"),
                width: "180px",
                align: "right" as const,
                cellRender: ({ value }: { value: any }) => (
                    <span className="text-slate-600 font-medium">{formatCurrency(value)}</span>
                ),
            },
            {
                field: "totalTax",
                header: t("table.totalTax"),
                width: "150px",
                align: "right" as const,
                cellRender: ({ value }: { value: any }) => (
                    <span className="text-rose-500/80 font-medium">{formatCurrency(value)}</span>
                ),
            },
            {
                field: "netRevenue",
                header: t("table.netRevenue"),
                width: "180px",
                align: "right" as const,
                cellRender: ({ value }: { value: any }) => (
                    <span className="font-bold text-emerald-600 text-base">
                        {formatCurrency(value)}
                    </span>
                ),
            },
            {
                field: "action",
                header: "",
                width: "80px",
                align: "center" as const,
                cellRender: ({ item }: { item: any }) => (
                    <button
                        onClick={() => handleViewDetail(item.date)}
                        className="p-1.5 text-slate-400 hover:text-[#C5A059] hover:bg-[#C5A059]/10 rounded-lg transition-colors"
                        title="View Details"
                    >
                        <ArrowRight size={18} />
                    </button>
                )
            }
        ],
        [t]
    );

    const handleGlobalRenderCell = useCallback(
        (value: any, item: EarningTableItemDto, column: TableColumn, rowIndex: number) => {
            const content = column.cellRender
                ? column.cellRender({ value, item, column, rowIndex })
                : value;
            return column.align ? <div style={{ textAlign: column.align }}>{content}</div> : content;
        },
        []
    );

    return (
        <div className="w-full h-full flex flex-col relative overflow-hidden">
            <div className="flex-1 min-h-0">
                <BaseTable<EarningTableItemDto>
                    data={data}
                    loading={isLoading}
                    columns={columns}
                    rowKey="date"
                    total={totalCount}
                    onDataChange={onDataChange}
                    onRefresh={refresh}
                    searchPlaceholder={tCommon("searchPlaceholder")}
                    defaultRowsPerPage={10}
                    rowsPerPageOptions={[10, 20, 50]}
                    renderTitle={() => (
                        <ALTitleCard
                            title={t("title")}
                            description={t("description", { defaultMessage: "Revenue breakdown by date including gross, net, and tax." })}
                            actions={
                                <EarningFilter
                                    initialStart={filters.startDate}
                                    initialEnd={filters.endDate}
                                    onApply={applyDateFilter}
                                />
                            }
                            className="mb-4 border-[#D5BA98]/40"
                        />
                    )}
                    renderCell={handleGlobalRenderCell}
                />
            </div>

            <EarningDetailDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                date={selectedDate}
            />
        </div>
    );
}