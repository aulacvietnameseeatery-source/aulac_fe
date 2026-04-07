"use client";

import React, { useMemo, useCallback } from "react";
import { UserRound, Phone } from "lucide-react";
import { BaseTable } from "@/components/ui/table/base-table";
import { TableColumn } from "@/types/table.types";
import { ALCard } from "@/components/ui/al-card";
import { useCustomerReport } from "@/features/staff/report-management/customer/hooks/use-customer-report";
import { CustomerReportRecordDto } from "@/features/staff/report-management/customer/types/customer-report-types";
import { CustomerFilter } from "@/features/staff/report-management/customer/components/customer-filter";
import { useTranslations } from "next-intl";

export default function CustomerReportPage() {
    const t = useTranslations("reports.customer");
    const tCommon = useTranslations("reports.common");

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
                header: t("table.customerId"),
                width: "120px",
                cellRender: ({ value }: { value: any }) => (
                    <span className="text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-md">
                        #{value.toString().padStart(5, '0')}
                    </span>
                ),
            },
            {
                field: "customerName",
                header: t("table.customerName"),
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
                header: t("table.totalOrders"),
                width: "150px",
                align: "center" as const,
                cellRender: ({ value }: { value: any }) => (
                    <span className="font-semibold text-gray-700">{value}</span>
                )
            },
            {
                field: "totalSpent",
                header: t("table.grandTotal"),
                width: "150px",
                align: "right" as const,
                cellRender: ({ value }: { value: any }) => (
                    <span className="font-bold text-gray-900 text-base">
                        {Number(value).toFixed(2)} CHF
                    </span>
                ),
            },
        ],
        [t]
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
        <div className="w-full flex flex-col gap-4">
            <div className="w-full">
                <BaseTable<CustomerReportRecordDto>
                    data={data}
                    loading={isLoading}
                    columns={columns}
                    rowKey="customerId"
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
                                <CustomerFilter
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