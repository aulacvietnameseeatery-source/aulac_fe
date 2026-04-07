"use client";

import React, { useMemo, useCallback } from "react";
import { Utensils } from "lucide-react";
import { BaseTable } from "@/components/ui/table/base-table";
import { TableColumn } from "@/types/table.types";
import { ALCard } from "@/components/ui/al-card";
import { useSalesReport } from "@/features/staff/report-management/sales/hooks/use-sales-report";
import { SalesItemDto } from "@/features/staff/report-management/sales/types/sales-report-types";
import { SalesFilter } from "@/features/staff/report-management/sales/components/sales-filter";
import { useTranslations } from "next-intl";

export default function SalesReportPage() {
    const t = useTranslations("reports.sales");
    const tCommon = useTranslations("reports.common");

    const {
        data,
        isLoading,
        totalCount,
        filters,
        onDataChange,
        refresh,
        applyDateFilter
    } = useSalesReport();

    const columns: TableColumn[] = useMemo(
        () => [
            {
                field: "dishId",
                header: t("table.itemId"),
                width: "100px",
                cellRender: ({ value }: { value: any }) => (
                    <span className="text-gray-500 text-xs font-mono">#{value}</span>
                ),
            },
            {
                field: "dishName",
                header: t("table.itemName"),
                width: "250px",
                filterType: "text" as const,
                cellRender: ({ value }: { value: any }) => (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 shrink-0">
                            <Utensils size={14}/>
                        </div>
                        <span className="text-gray-900 font-medium">{value}</span>
                    </div>
                ),
            },
            {
                field: "categoryName",
                header: t("table.category"),
                width: "150px",
                cellRender: ({ value }: { value: any }) => (
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                        {value}
                    </span>
                )
            },
            {
                field: "quantitySold",
                header: t("table.itemsSold"),
                width: "120px",
                align: "center" as const,
                sortable: true,
                cellRender: ({ value }: { value: any }) => (
                    <span className="font-semibold text-blue-600">{value}</span>
                )
            },
            {
                field: "totalRevenue",
                header: t("table.totalRevenue"),
                width: "150px",
                align: "right" as const,
                sortable: true,
                cellRender: ({ value }: { value: any }) => (
                    <span className="font-bold text-gray-900">
                        {Number(value).toFixed(2)} CHF
                    </span>
                ),
            },
        ],
        [t]
    );

    const handleGlobalRenderCell = useCallback(
        (value: any, item: SalesItemDto, column: TableColumn, rowIndex: number) => {
            const content = column.cellRender
                ? column.cellRender({ value, item, column, rowIndex })
                : value;
            return column.align ? <div style={{ textAlign: column.align }}>{content}</div> : content;
        },
        []
    );

    return (
        <div className="w-full flex flex-col gap-4">
            <div className="w-full">
                <BaseTable<SalesItemDto>
                    data={data}
                    loading={isLoading}
                    columns={columns}
                    rowKey="dishId"
                    total={totalCount}
                    onDataChange={onDataChange}
                    onRefresh={refresh}
                    searchPlaceholder={t("searchPlaceholder")}
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
                                <SalesFilter
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