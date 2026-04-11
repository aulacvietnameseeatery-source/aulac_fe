"use client";

import React, { useMemo, useCallback, useState } from "react";
import { BaseTable } from "@/components/ui/table/base-table";
import { TableColumn } from "@/types/table.types";
import { ALCard } from "@/components/ui/al-card";
import { useOrderReport } from "@/features/staff/report-management/order/hooks/use-order-report";
import { OrderFilter } from "@/features/staff/report-management/order/components/order-filter";
import { OrderReportRecordDto } from "@/features/staff/report-management/order/types/order-report-types";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

// IMPORT DRAWER COMPONENT (Tạo ở bước 3)
import { OrderDetailDrawer } from "@/features/staff/report-management/order/components/order-detail-drawer";

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

    // STATE CHO DRAWER
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleViewDetail = (orderId: string) => {
        setSelectedOrderId(orderId);
        setIsDrawerOpen(true);
    };

    const columns: TableColumn[] = useMemo(
        () => [
            {
                field: "orderId",
                header: t("table.orderId"),
                width: "120px",
                cellRender: ({ value }: { value: any }) => (
                    <button
                        onClick={() => handleViewDetail(value)}
                        className="text-blue-600 font-bold hover:text-[#C5A059] transition-all group"
                    >
                        <span className="underline underline-offset-4 decoration-blue-200 group-hover:decoration-[#C5A059]">
                            #{value}
                        </span>
                    </button>
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
                    return <span className="text-gray-600 font-medium">{displayDate}</span>;
                }
            },
            {
                field: "customerName",
                header: t("table.customer"),
                width: "180px",
                cellRender: ({ value }: { value: any }) => (
                    <span className="text-gray-800 font-bold">{value || "Guest"}</span>
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
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border uppercase tracking-wider ${
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
                    <span className="font-semibold text-slate-600">{value ?? 0}</span>
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
                        <span className="font-extrabold text-[#1A3A52]">
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
                    const statusStr = String(value || "Unknown");
                    const isCompleted = statusStr.toLowerCase() === "completed" || statusStr.toLowerCase() === "paid";
                    return (
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border uppercase tracking-wider ${
                            isCompleted
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                            {statusStr}
                        </span>
                    );
                }
            },
            // CỘT ACTION MỞ DRAWER
            {
                field: "action",
                header: "",
                width: "80px",
                align: "center" as const,
                cellRender: ({ item }: { item: any }) => (
                    <button
                        onClick={() => handleViewDetail(item.orderId)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Receipt"
                    >
                        <ArrowRight size={18} />
                    </button>
                )
            }
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
        <div className="w-full h-full flex flex-col relative overflow-hidden">
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
                        <ALCard padding="sm" variant="default" elevation="sm" className="w-full mb-4 border-[#D5BA98]/40">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                                <div>
                                    <h2 className="text-lg font-extrabold tracking-tight text-[#1A3A52]">
                                        {t("title")}
                                    </h2>
                                    <p className="mt-0.5 text-sm font-medium text-slate-500">
                                        {t("description", { defaultMessage: "Detailed list of all orders within the selected period." })}
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

            <OrderDetailDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                orderId={selectedOrderId}
            />
        </div>
    );
}