"use client";

import React, { useMemo, useCallback, useState } from "react";
import { UserRound, Phone, ArrowRight } from "lucide-react";
import { BaseTable } from "@/components/ui/table/base-table";
import { TableColumn } from "@/types/table.types";
import { ALCard } from "@/components/ui/al-card";
import { useCustomerReport } from "@/features/staff/report-management/customer/hooks/use-customer-report";
import { CustomerReportRecordDto } from "@/features/staff/report-management/customer/types/customer-report-types";
import { CustomerFilter } from "@/features/staff/report-management/customer/components/customer-filter";
import { useTranslations } from "next-intl";

// IMPORT COMPONENT DRAWER (Tạo ở bước 3)
import { CustomerDetailDrawer } from "@/features/staff/report-management/customer/components/customer-detail-drawer";

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

    // STATE QUẢN LÝ DRAWER
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
    const [selectedCustomerName, setSelectedCustomerName] = useState<string | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleViewDetail = (customerId: string, customerName: string) => {
        setSelectedCustomerId(customerId);
        setSelectedCustomerName(customerName);
        setIsDrawerOpen(true);
    };

    const columns: TableColumn[] = useMemo(
        () => [
            {
                field: "customerId",
                header: t("table.customerId"),
                width: "120px",
                cellRender: ({ value }: { value: any }) => (
                    <span className="text-slate-400 font-mono text-xs font-bold bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        #{value.toString().padStart(5, '0')}
                    </span>
                ),
            },
            {
                field: "customerName",
                header: t("table.customerName"),
                width: "250px",
                cellRender: ({ value, item }: { value: any; item: CustomerReportRecordDto }) => (
                    <button
                        onClick={() => handleViewDetail(item.customerId.toString(), value)}
                        className="flex items-center gap-3 text-left group w-full"
                    >
                        <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0 group-hover:bg-[#1A3A52] group-hover:text-white transition-colors">
                            <UserRound size={16}/>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[#1A3A52] font-bold group-hover:text-[#C5A059] transition-colors leading-tight">
                                {value || "Guest"}
                            </span>
                            {item.phone && (
                                <span className="text-[11px] font-medium text-slate-400 flex items-center mt-0.5">
                                    <Phone size={10} className="mr-1"/> {item.phone}
                                </span>
                            )}
                        </div>
                    </button>
                ),
            },
            {
                field: "totalOrders",
                header: t("table.totalOrders"),
                width: "150px",
                align: "center" as const,
                cellRender: ({ value }: { value: any }) => (
                    <span className="font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                        {value}
                    </span>
                )
            },
            {
                field: "totalSpent",
                header: t("table.grandTotal"),
                width: "150px",
                align: "right" as const,
                cellRender: ({ value }: { value: any }) => (
                    <span className="font-extrabold text-[#1A3A52] text-base">
                        {Number(value).toFixed(2)} CHF
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
                        onClick={() => handleViewDetail(item.customerId.toString(), item.customerName)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Profile"
                    >
                        <ArrowRight size={18} />
                    </button>
                )
            }
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
        <div className="w-full h-full flex flex-col relative overflow-hidden">
            <div className="flex-1 min-h-0">
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
                        <ALCard padding="sm" variant="default" elevation="sm" className="w-full mb-4 border-[#D5BA98]/40">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                                <div>
                                    <h2 className="text-lg font-extrabold tracking-tight text-[#1A3A52]">
                                        {t("title")}
                                    </h2>
                                    <p className="mt-0.5 text-sm font-medium text-slate-500">
                                        {t("description", { defaultMessage: "Analysis of customer purchasing behavior." })}
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

            <CustomerDetailDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                customerId={selectedCustomerId}
                customerName={selectedCustomerName}
            />
        </div>
    );
}