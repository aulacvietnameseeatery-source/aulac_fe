"use client";

import React, { Suspense, useCallback, useMemo, useState } from "react";
import { Loader2, Receipt, UserCircle2, Hash, Download } from "lucide-react";
import { BaseTable } from "@/components/ui/table/base-table";
import { TableColumn } from "@/types/table.types";
import { useTranslations } from "next-intl";
import { ProtectedRoute } from "@/components/protected-route";
import { Permissions } from "@/types/const";
import { ALTitleCard } from "@/components/ui/al-title-card";
import dayjs from "dayjs";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import { usePaymentList } from "@/features/staff/payment-management/hooks/use-payment-list";
import { PaymentListDto } from "@/features/staff/payment-management/types/payment-types";
import { excelUtils } from "@/lib/excel-utils";
import { staffPaymentService } from "@/features/staff/payment-management/services/payment-service";
import { dateUtils } from "@/lib/date-utils";

// Helper format tiền tệ CHF
const formatCHF = (amount: number) => {
    return new Intl.NumberFormat('fr-CH', {
        style: 'currency',
        currency: 'CHF',
        minimumFractionDigits: 2,
    }).format(amount);
};

const getUtcDateString = (utcDateString: string) => {
        const dateStringWithZ = utcDateString.endsWith('Z') ? utcDateString : `${utcDateString}Z`;
        return dateStringWithZ;
    };

const PaymentListContent = () => {
    const t = useTranslations("Payment.List");

    const [selectedMethod, setSelectedMethod] = useState("");
    const { payments, isLoading, totalCount, paginationInfo, onDataChange, refresh } = usePaymentList(selectedMethod || undefined);

    const [isExportingAll, setIsExportingAll] = useState(false);

    // Xuất dữ liệu trang hiện tại
    const handleExport = () => {
        if (!payments || payments.length === 0) {
            toast.error(t("notifications.noDataExport"));
            return;
        }
        excelUtils.exportPaymentsToExcel(payments, `Payments_Page_${format(new Date(), "yyyyMMdd")}.xlsx`);
        toast.success(t("notifications.exportSuccess"));
    };

    // Xuất toàn bộ dữ liệu bằng cách ép pageSize = totalCount
    const handleExportAll = async () => {
        if (totalCount === 0) {
            toast.error(t("notifications.noDataExport"));
            return;
        }

        setIsExportingAll(true);
        const toastId = toast.loading(t("exportingAll"));
        
        try {
            const allData = await staffPaymentService.getAllPayments(totalCount);

            if (!Array.isArray(allData) || allData.length === 0) {
                toast.error(t("notifications.noDataExport"), { id: toastId });
                return;
            }
            
            excelUtils.exportPaymentsToExcel(allData, `All_Payments_${format(new Date(), "yyyyMMdd")}.xlsx`);
            toast.success(t("notifications.exportSuccess"), { id: toastId });
        } catch (error) {
            console.error("Export All Error:", error);
            toast.error(t("notifications.exportError"), { id: toastId });
        } finally {
            setIsExportingAll(false);
        }
    };

    const methodFilterOptions = useMemo(() => [
        { label: t("labels.all"),      value: "" },
        { label: t("labels.cash"),     value: "Cash" },
        { label: t("labels.card"),     value: "Card" },
        { label: t("labels.transfer"), value: "Qr" },
    ], [t]);

    // Table Columns định nghĩa hiển thị TẤT CẢ các field
    const columns: TableColumn[] = useMemo(() => [
        {
            field: "no",
            header: t("table.no"),
            width: "50px",
            align: "center" as const,
            sortable: false,
            cellRender: ({ rowIndex }: { rowIndex: number }) =>
                (paginationInfo.page - 1) * paginationInfo.pageSize + rowIndex + 1,
        },
        {
            field: "orderId",
            header: t("table.orderId"),
            width: "110px",
            align: "center" as const,
            cellRender: ({ value }: { value: number }) => (
                <div className="flex items-center justify-center gap-2">
                    <span className="font-medium text-blue-600">#{value}</span>
                </div>
            ),
        },
        {
            field: "customerName",
            header: t("table.customer"),
            width: "200px",
            filterType: "text" as const,
            cellRender: ({ item }: { item: PaymentListDto }) => {
                const isGuest = !item.customerName || item.customerName.toLowerCase() === "guest" || item.customerPhone === "0000000000";
                
                if (isGuest) {
                    return (
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                                <span className="font-medium text-gray-500 italic">{t("labels.guest")}</span>
                                <span className="text-xs text-gray-400">-</span>
                            </div>
                        </div>
                    );
                }

                return (
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{item.customerName}</span>
                            <span className="text-xs text-gray-500">{item.customerPhone}</span>
                        </div>
                    </div>
                );
            },
        },
        {
            field: "method",
            header: t("table.method"),
            width: "110px",
            align: "center" as const,
            cellRender: ({ value }: { value: string }) => {
                const isCash = value === "Cash";
                const isCard = value === "Card";
                return (
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        isCash ? "bg-green-100 text-green-700" :
                        isCard ? "bg-blue-100 text-blue-700" :
                        "bg-purple-100 text-purple-700"
                    }`}>
                        {isCash ? t("labels.cash") : isCard ? t("labels.card") : t("labels.transfer")}
                    </span>
                );
            },
        },
        {
            field: "receivedAmount",
            header: t("table.receivedAmount"),
            width: "110px",
            align: "center" as const,
            cellRender: ({ value }: { value: number }) => (
                <span className="text-gray-600">{formatCHF(value)}</span>
            ),
        },
        {
            field: "changeAmount",
            header: t("table.changeAmount"),
            width: "110px",
            align: "center" as const,
            cellRender: ({ value }: { value: number }) => (
                <span className="text-orange-600">{formatCHF(value)}</span>
            ),
        },
        {
            field: "finalAmount",
            header: t("table.finalAmount"),
            width: "120px",
            align: "center" as const,
            cellRender: ({ value }: { value: number }) => (
                <span className="font-bold text-gray-900">{formatCHF(value)}</span>
            ),
        },
        {
            field: "paidAt",
            header: t("table.paidAt"),
            width: "150px",
            align: "center" as const,
            cellRender: ({ value }: { value: string | null }) => (
                <span className="text-gray-600 text-sm">
                    {value ? dateUtils.formatLocal(getUtcDateString(value), "dd/MM/yyyy HH:mm") : "-"}
                </span>
            ),
        },
    ], [paginationInfo.page, paginationInfo.pageSize, t, methodFilterOptions]);

    const handleGlobalRenderCell = useCallback(
        (value: any, item: PaymentListDto, column: TableColumn, rowIndex: number) => {
            const content = column.cellRender
                ? column.cellRender({ value, item, column, rowIndex })
                : value;
            return column.align ? <div style={{ textAlign: column.align }}>{content}</div> : content;
        },
        []
    );

    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            <BaseTable<PaymentListDto>
                data={payments}
                loading={isLoading}
                columns={columns}
                rowKey="paymentId"
                total={totalCount}
                onDataChange={onDataChange}
                onRefresh={refresh}
                searchPlaceholder={t("searchPlaceholder")}
                defaultRowsPerPage={10}
                rowsPerPageOptions={[10, 20, 50]}
                renderTitle={() => (
                    <ALTitleCard
                        title={t("title")}
                        description={t("description")}
                        actions={
                            <>
                                <Button
                                    variant="outline"
                                    className="w-full whitespace-nowrap bg-white sm:w-auto"
                                    onClick={handleExport}
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    {t("export") || "Export"}
                                </Button>

                                <Button
                                    variant="outline"
                                    className="w-full whitespace-nowrap border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 sm:w-auto"
                                    onClick={handleExportAll}
                                    disabled={isExportingAll}
                                >
                                    {isExportingAll ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                    {t("exportAll")}
                                </Button>
                            </>
                        }
                    >
                        {/* Quick-filter theo phương thức thanh toán */}
                        <div className="flex flex-wrap gap-2">
                            {methodFilterOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setSelectedMethod(opt.value)}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-colors ${
                                        selectedMethod === opt.value
                                            ? "bg-[#1A3A52] text-white border-[#1A3A52]"
                                            : "bg-white text-gray-600 border-gray-200 hover:border-[#1A3A52] hover:text-[#1A3A52]"
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </ALTitleCard>
                    
                )}
                renderCell={handleGlobalRenderCell}
            />
        </div>
    );
};

export default function PaymentListPage() {
    return (
        <ProtectedRoute permission={Permissions.ViewPayment}> 
            <Suspense fallback={
                <div className="flex h-screen items-center justify-center">
                    <Loader2 className="animate-spin text-gray-400" />
                </div>
            }>
                <PaymentListContent />
            </Suspense>
        </ProtectedRoute>
    );
}