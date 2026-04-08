"use client";

import React, { useMemo, useCallback } from "react";
import { BaseTable } from "@/components/ui/table/base-table";
import { TableColumn } from "@/types/table.types";
import { ALCard } from "@/components/ui/al-card";
import { useOrderReport } from "@/features/staff/report-management/order/hooks/use-order-report";
import { OrderFilter } from "@/features/staff/report-management/order/components/order-filter";
import { OrderReportRecordDto } from "@/features/staff/report-management/order/types/order-report-types";
import { useTranslations } from "next-intl";

export default function OrderReportPage() {
    const t = useTranslations("reports.order");
    const tCommon = useTranslations("reports.common");

    const {
        data,
        isLoading,
        totalCount,
        filters,
        onDataChange,
        refresh,
        applyDateFilter
    } = useOrderReport();

    const columns: TableColumn[] = useMemo(
        () => [
            {
                field: "orderId",
                header: t("table.orderId"),
                width: "120px",
                cellRender: ({ value }: { value: any }) => (
                    <span className="text-blue-600 font-medium">#{value}</span>
                ),
            },
            {
                field: "createdAt",
                header: t("table.date"),
                width: "140px",
                cellRender: ({ value }: { value: any }) => {
                    if (!value) return <span className="text-gray-400">-</span>;
                    const displayDate = (typeof value === 'string' && value.includes("T"))
                        ? value.split("T")[0]
                        : value;
                    return <span className="text-gray-600">{displayDate}</span>;
                }
            },
            {
                field: "customerName",
                header: t("table.customer"),
                width: "180px",
                cellRender: ({ value }: { value: any }) => (
                    <span className="text-gray-800 font-medium">{value || "Guest"}</span>
                ),
            },
            {
                field: "source",
                header: t("table.type"),
                width: "120px",
                cellRender: ({ value }: { value: any }) => {
                    const typeStr = value || "Unknown";
                    const isDineIn = String(typeStr).toLowerCase().includes("dine");
                    return (
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                            isDineIn
                                ? 'bg-orange-50 text-orange-700 border-orange-100'
                                : 'bg-purple-50 text-purple-700 border-purple-100'
                        }`}>
                            {String(typeStr).replace('_', ' ')}
                        </span>
                    );
                }
            },
            {
                field: "itemCount",
                header: t("table.items"),
                width: "90px",
                align: "center" as const,
                cellRender: ({ value }: { value: any }) => (
                    <span>{value ?? 0}</span>
                )
            },
            {
                field: "totalAmount",
                header: t("table.grandTotal"),
                width: "130px",
                align: "right" as const,
                sortable: true,
                cellRender: ({ value }: { value: any }) => {
                    const amount = value ?? 0;
                    return (
                        <span className="font-bold text-gray-900">
                            {Number(amount).toFixed(2)} CHF
                        </span>
                    );
                },
            },
            {
                field: "orderStatus",
                header: t("table.status"),
                width: "120px",
                align: "center" as const,
                cellRender: ({ value }: { value: any }) => {
                    const statusStr = value || "Unknown";
                    const isCompleted = String(statusStr).toLowerCase() === "completed" || String(statusStr).toLowerCase() === "paid";
                    return (
                        <span className={`px-2.5 py-1 rounded text-[11px] font-semibold border ${
                            isCompleted
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}>
                            {statusStr}
                        </span>
                    );
                }
            },
        ],
        [t]
    );

    const handleGlobalRenderCell = useCallback(
        (value: any, item: OrderReportRecordDto, column: TableColumn, rowIndex: number) => {
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
                <BaseTable<OrderReportRecordDto>
                    data={data}
                    loading={isLoading}
                    columns={columns}
                    rowKey="orderId"
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
                                <OrderFilter
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