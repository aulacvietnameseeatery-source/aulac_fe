"use client";

import React, { useMemo, useCallback } from "react";
import { BaseTable } from "@/components/ui/table/base-table";
import { TableColumn } from "@/types/table.types";
import { CalendarDays } from "lucide-react";
import {useEarningReport} from "@/features/staff/report-management/earning/hooks/use-earning-report";
import { EarningFilter } from "@/features/staff/report-management/earning/components/earning-filter";
import {EarningTableItemDto} from "@/features/staff/report-management/earning/types/earning-types";

export default function EarningReportPage() {
    const {
        data,
        isLoading,
        totalCount,
        filters,
        onDataChange,
        refresh,
        applyDateFilter
    } = useEarningReport();

    // Hàm format tiền tệ CHF (Thụy Sĩ)
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
                header: "Date",
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
                header: "Total Orders",
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
                header: "Gross Revenue",
                width: "180px",
                align: "right" as const,
                cellRender: ({ value }: { value: any }) => (
                    <span className="text-gray-600">{formatCurrency(value)}</span>
                ),
            },
            {
                field: "totalTax",
                header: "Total Tax",
                width: "150px",
                align: "right" as const,
                cellRender: ({ value }: { value: any }) => (
                    <span className="text-red-500/80">{formatCurrency(value)}</span>
                ),
            },
            {
                field: "netRevenue",
                header: "Net Revenue",
                width: "180px",
                align: "right" as const,
                cellRender: ({ value }: { value: any }) => (
                    <span className="font-bold text-emerald-600 text-base">
                        {formatCurrency(value)}
                    </span>
                ),
            },
        ],
        []
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
        <div className="w-full h-full flex flex-col gap-6"> {/* THÊM gap-6 */}
            <EarningFilter
                initialStart={filters.startDate}
                initialEnd={filters.endDate}
                onApply={applyDateFilter}
            />

            {/* XÓA BỎ các class viền, bo góc, màu nền */}
            <div className="flex-1 w-full overflow-hidden">
                <BaseTable<EarningTableItemDto>
                    data={data}
                    loading={isLoading}
                    columns={columns}
                    rowKey="date"
                    total={totalCount}
                    onDataChange={onDataChange}
                    onRefresh={refresh}
                    searchPlaceholder="Search date..."
                    defaultRowsPerPage={10}
                    rowsPerPageOptions={[10, 20, 50]}
                    renderTitle={() => (
                        <div className="pb-4"> {/* ĐỔI py-2 px-4 thành pb-4 */}
                            <h2 className="text-xl font-bold text-gray-800 tracking-tight">
                                Daily Earning Summary
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Revenue breakdown by date including gross, net, and tax.
                            </p>
                        </div>
                    )}
                    renderCell={handleGlobalRenderCell}
                />
            </div>
        </div>
    );
}