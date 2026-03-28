"use client";

import React, { useMemo, useCallback } from "react";
import { UserRound, Phone } from "lucide-react";
import { BaseTable } from "@/components/ui/table/base-table";
import { TableColumn } from "@/types/table.types";
import {useCustomerReport} from "@/features/staff/report-management/customer/hooks/use-customer-report";
import { CustomerReportRecordDto } from "@/features/staff/report-management/customer/types/customer-report-types";
import {CustomerFilter} from "@/features/staff/report-management/customer/components/customer-filter";

export default function CustomerReportPage() {
    const {
        data,
        isLoading,
        totalCount,
        filters,
        onDataChange,
        refresh,
        applyDateFilter
    } = useCustomerReport();

    const columns: TableColumn[] = useMemo(
        () => [
            {
                field: "customerId",
                header: "Customer ID",
                width: "120px",
                cellRender: ({ value }: { value: any }) => (
                    <span className="text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-md">
                        #{value.toString().padStart(5, '0')}
                    </span>
                ),
            },
            {
                field: "customerName",
                header: "Customer Name",
                width: "250px",
                cellRender: ({ value, item }: { value: any; item: CustomerReportRecordDto }) => (
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 shrink-0">
                            <UserRound size={16}/>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-gray-900 font-medium">{value}</span>
                            {item.phone && (
                                <span className="text-xs text-gray-500 flex items-center mt-0.5">
                                    <Phone size={10} className="mr-1"/> {item.phone}
                                </span>
                            )}
                        </div>
                    </div>
                ),
            },
            {
                field: "totalOrders",
                header: "Total Orders",
                width: "150px",
                align: "center" as const,
                cellRender: ({ value }: { value: any }) => (
                    <span className="font-semibold text-gray-700">{value}</span>
                )
            },
            {
                field: "totalSpent",
                header: "Grand Total",
                width: "150px",
                align: "right" as const,
                cellRender: ({ value }: { value: any }) => (
                    <span className="font-bold text-gray-900 text-base">
                        {Number(value).toFixed(2)} CHF
                    </span>
                ),
            },
        ],
        []
    );

    const handleGlobalRenderCell = useCallback(
        (value: any, item: CustomerReportRecordDto, column: TableColumn, rowIndex: number) => {
            const content = column.cellRender
                ? column.cellRender({ value, item, column, rowIndex })
                : value;
            return column.align ? <div style={{ textAlign: column.align }}>{content}</div> : content;
        },
        []
    );

    return (
        <div className="w-full h-full flex flex-col gap-6"> {/* THÊM gap-6 */}
            <CustomerFilter
                initialStart={filters.startDate}
                initialEnd={filters.endDate}
                onApply={applyDateFilter}
            />

            {/* XÓA BỎ các class viền, bo góc, màu nền */}
            <div className="flex-1 w-full overflow-hidden">
                <BaseTable<CustomerReportRecordDto>
                    data={data}
                    loading={isLoading}
                    columns={columns}
                    rowKey="customerId"
                    total={totalCount}
                    onDataChange={onDataChange}
                    onRefresh={refresh}
                    searchPlaceholder="Search customer..."
                    defaultRowsPerPage={10}
                    rowsPerPageOptions={[10, 20, 50]}
                    renderTitle={() => (
                        <div className="pb-4"> {/* ĐỔI py-2 px-4 thành pb-4 */}
                            <h2 className="text-xl font-bold text-gray-800 tracking-tight">
                                Top Spenders
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Analysis of customer purchasing behavior.
                            </p>
                        </div>
                    )}
                    renderCell={handleGlobalRenderCell}
                />
            </div>
        </div>
    );
}