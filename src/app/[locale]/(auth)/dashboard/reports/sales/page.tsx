"use client";

import React, { useMemo, useCallback } from "react";
import { Utensils } from "lucide-react";
import { BaseTable } from "@/components/ui/table/base-table";
import { TableColumn } from "@/types/table.types";
import {useSalesReport} from "@/features/staff/report-management/sales/hooks/use-sales-report";
import {SalesItemDto} from "@/features/staff/report-management/sales/types/sales-report-types";
import {SalesFilter} from "@/features/staff/report-management/sales/components/sales-filter";

export default function SalesReportPage() {
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
                header: "Item ID",
                width: "100px",
                cellRender: ({ value }: { value: any }) => (
                    <span className="text-gray-500 text-xs font-mono">#{value}</span>
                ),
            },
            {
                field: "dishName",
                header: "Item Name",
                width: "250px",
                filterType: "text" as const, // Kích hoạt thanh search nếu component hỗ trợ
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
                header: "Category",
                width: "150px",
                cellRender: ({ value }: { value: any }) => (
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                        {value}
                    </span>
                )
            },
            {
                field: "quantitySold",
                header: "Items Sold",
                width: "120px",
                align: "center" as const,
                sortable: true,
                cellRender: ({ value }: { value: any }) => (
                    <span className="font-semibold text-blue-600">{value}</span>
                )
            },
            {
                field: "totalRevenue",
                header: "Total Revenue",
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
        []
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
        <div className="w-full h-full flex flex-col">
            <SalesFilter
                initialStart={filters.startDate}
                initialEnd={filters.endDate}
                onApply={applyDateFilter}
            />

            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <BaseTable<SalesItemDto>
                    data={data}
                    loading={isLoading}
                    columns={columns}
                    rowKey="dishId"
                    total={totalCount}
                    onDataChange={onDataChange}
                    onRefresh={refresh}
                    searchPlaceholder="Search dish name..."
                    defaultRowsPerPage={10}
                    rowsPerPageOptions={[10, 20, 50]}
                    renderTitle={() => (
                        <div className="py-2 px-4">
                            <h2 className="text-xl font-bold text-gray-800 tracking-tight">
                                Item Sales Performance
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Analysis of best-selling dishes and revenue contribution.
                            </p>
                        </div>
                    )}
                    renderCell={handleGlobalRenderCell}
                />
            </div>
        </div>
    );
}