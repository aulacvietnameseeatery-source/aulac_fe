"use client";

import React, { useMemo, useCallback, useState } from "react";
import { Utensils, ArrowRight } from "lucide-react";
import { BaseTable } from "@/components/ui/table/base-table";
import { TableColumn } from "@/types/table.types";
import { ALCard } from "@/components/ui/al-card";
import { useSalesReport } from "@/features/staff/report-management/sales/hooks/use-sales-report";
import { SalesItemDto } from "@/features/staff/report-management/sales/types/sales-report-types";
import { SalesFilter } from "@/features/staff/report-management/sales/components/sales-filter";
import { useTranslations } from "next-intl";

import { SalesDetailDrawer } from "@/features/staff/report-management/sales/components/sales-detail-drawer";

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

    // STATE QUẢN LÝ DRAWER
    const [selectedDishId, setSelectedDishId] = useState<string | null>(null);
    const [selectedDishName, setSelectedDishName] = useState<string | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleViewDetail = (dishId: string, dishName: string) => {
        setSelectedDishId(dishId);
        setSelectedDishName(dishName);
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
                field: "dishId",
                header: t("table.itemId"),
                width: "100px",
                cellRender: ({ value }: { value: any }) => (
                    <span className="text-slate-400 text-xs font-mono font-bold">#{value}</span>
                ),
            },
            {
                field: "dishName",
                header: t("table.itemName"),
                width: "250px",
                filterType: "text" as const,
                cellRender: ({ value, item }: { value: any, item: any }) => (
                    <button
                        onClick={() => handleViewDetail(item.dishId, value)}
                        className="flex items-center gap-3 text-left group w-full"
                    >
                        <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 shrink-0 group-hover:bg-[#1A3A52] group-hover:text-white group-hover:border-[#1A3A52] transition-colors">
                            <Utensils size={14} />
                        </div>
                        <span className="text-[#1A3A52] font-bold group-hover:text-[#C5A059] transition-colors leading-tight">
                            {value}
                        </span>
                    </button>
                ),
            },
            {
                field: "categoryName",
                header: t("table.category"),
                width: "150px",
                cellRender: ({ value }: { value: any }) => (
                    <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-600 rounded-md text-[11px] font-bold uppercase tracking-wider">
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
                    <span className="font-bold text-blue-600 text-base">{value}</span>
                )
            },
            {
                field: "totalRevenue",
                header: t("table.totalRevenue"),
                width: "150px",
                align: "right" as const,
                sortable: true,
                cellRender: ({ value }: { value: any }) => (
                    <span className="font-extrabold text-[#1A3A52] text-base">
                        {Number(value).toFixed(2)} CHF
                    </span>
                ),
            },
            // CỘT ACTION MỞ DRAWER
            {
                field: "action",
                header: "",
                width: "80px",
                align: "center" as const,
                cellRender: ({ item }: { item: any }) => (
                    <button
                        onClick={() => handleViewDetail(item.dishId, item.dishName)}
                        className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                        title="View Performance"
                    >
                        <ArrowRight size={18} />
                    </button>
                )
            }
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
        <div className="w-full h-full flex flex-col relative overflow-hidden">
            <div className="flex-1 min-h-0">
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
                        <ALCard padding="sm" variant="default" elevation="sm" className="w-full mb-4 border-[#D5BA98]/40">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                                <div>
                                    <h2 className="text-lg font-extrabold tracking-tight text-[#1A3A52]">
                                        {t("title")}
                                    </h2>
                                    <p className="mt-0.5 text-sm font-medium text-slate-500">
                                        {t("description", { defaultMessage: "Analysis of best-selling dishes and revenue contribution." })}
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

            <SalesDetailDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                dishId={selectedDishId}
                dishName={selectedDishName}
            />
        </div>
    );
}