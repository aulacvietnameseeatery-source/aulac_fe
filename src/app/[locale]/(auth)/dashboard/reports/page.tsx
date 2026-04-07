"use client";

import React, { useMemo, useCallback } from "react";
import { BaseTable } from "@/components/ui/table/base-table";
import { TableColumn } from "@/types/table.types";
import { CalendarDays } from "lucide-react";
import { ALCard } from "@/components/ui/al-card";
import { useEarningReport } from "@/features/staff/report-management/earning/hooks/use-earning-report";
import { EarningFilter } from "@/features/staff/report-management/earning/components/earning-filter";
import { EarningTableItemDto } from "@/features/staff/report-management/earning/types/earning-types";
import { useTranslations } from "next-intl";

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
                    <div className="flex items-center gap-2 text-gray-800 font-medium">
                        <CalendarDays size={16} className="text-blue-500" />
                        {value}
                    </div>
                ),
            },
            {
                field: "totalOrders",
                header: t("table.totalOrders"),
                width: "150px",
                align: "center" as const,
                cellRender: ({ value }: { value: any }) => (
                    <span className="font-semibold text-gray-700 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
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
                    <span className="text-gray-600">{formatCurrency(value)}</span>
                ),
            },
            {
                field: "totalTax",
                header: t("table.totalTax"),
                width: "150px",
                align: "right" as const,
                cellRender: ({ value }: { value: any }) => (
                    <span className="text-red-500/80">{formatCurrency(value)}</span>
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
        <div className="w-full h-full flex flex-col">
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
                        <ALCard padding="sm" variant="default" elevation="sm" className="w-full">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold tracking-wide text-[#1A3A52]">
                                        {t("title")}
                                    </h2>
                                    <p className="mt-0.5 text-sm text-[#1A3A52]/65">
                                        {t("description")}
                                    </p>
                                </div>
                                <EarningFilter
                                    initialStart={filters.startDate}
                                    initialEnd={filters.endDate}
                                    onApply={applyDateFilter}
                                />
                            </div>
                        </ALCard>
                    )}
                    renderCell={handleGlobalRenderCell}
                />
            </div>
        </div>
    );
}