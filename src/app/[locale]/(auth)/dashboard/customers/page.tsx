"use client";

import React, { Suspense, useCallback, useMemo } from "react";
import { Loader2, Plus, UserCircle2 } from "lucide-react";
import { BaseTable } from "@/components/ui/table/base-table";
import { TableColumn } from "@/types/table.types";
import { useTranslations } from "next-intl";
import { ProtectedRoute } from "@/components/protected-route";
import { PermissionGuard } from "@/components/permission-guard";
import { Permissions } from "@/types/const";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useCustomerList } from "@/features/staff/customer-management/hooks/use-customer-list";
import { CustomerListDto } from "@/features/staff/customer-management/types/customer-types";
import { CustomerActions } from "@/features/staff/customer-management/components/customer-actions";
import { Badge } from "@/components/ui/badge"; 
import dayjs from "dayjs"; 

const CustomerListContent = () => {
    const t = useTranslations("Customer.List");
    const router = useRouter();

    const { customers, isLoading, totalCount, paginationInfo, onDataChange, refresh } = useCustomerList();

    const handleView = (customer: CustomerListDto) => {
        router.push(`/dashboard/customers/${customer.customerId}/detail`);
    };

    const handleEdit = (customer: CustomerListDto) => {
        router.push(`/dashboard/customers/${customer.customerId}/edit`);
    };

    const handleCreate = () => {
        router.push(`/dashboard/customers/create`);
    };

    // Filter Options
    const memberFilterOptions = useMemo(() => [
        { label: t("filters.member"), value: "true" },
        { label: t("filters.guest"), value: "false" }
    ], [t]);

    // Table Columns
    const columns: TableColumn[] = useMemo(() => [
        {
            field: "no",
            header: t("table.no"),
            width: "70px",
            align: "center" as const,
            sortable: false,
            cellRender: ({ rowIndex }: { rowIndex: number }) =>
                (paginationInfo.page - 1) * paginationInfo.pageSize + rowIndex + 1,
        },
        {
            field: "fullName",
            header: t("table.customerName"),
            width: "250px",
            filterType: "text" as const,
            cellRender: ({ item }: { item: CustomerListDto }) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <UserCircle2 size={20} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{item.fullName || "Guest"}</span>
                        <span className="text-xs text-gray-500">{item.phone}</span>
                    </div>
                </div>
            ),
        },
        {
            field: "email",
            header: t("table.email"),
            width: "200px",
            cellRender: ({ value }: { value: string | null }) => (
                <span className="text-gray-600">{value || "-"}</span>
            ),
        },
        {
            field: "isMember",
            header: t("table.type"),
            width: "120px",
            align: "center" as const,
            filterType: "select" as const,
            filterOptions: memberFilterOptions,
            cellRender: ({ value }: { value: boolean }) => (
                value ? 
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">{t("labels.member")}</span> : 
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">{t("labels.guest")}</span>
            ),
        },
        {
            field: "orderCount",
            header: t("table.orders"),
            width: "100px",
            align: "center" as const,
            cellRender: ({ value }: { value: number }) => (
                <span className="font-semibold text-gray-700">{value}</span>
            ),
        },
        {
            field: "loyaltyPoints",
            header: t("table.points"),
            width: "100px",
            align: "center" as const,
            cellRender: ({ value }: { value: number | null }) => (
                <span className="text-orange-600 font-medium">{value || 0}</span>
            ),
        },
        {
            field: "lastOrderTime",
            header: t("table.lastOrder"),
            width: "160px",
            cellRender: ({ value }: { value: string | null }) => (
                <span className="text-gray-600 text-sm">
                    {value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "-"}
                </span>
            ),
        },
    ], [paginationInfo.page, paginationInfo.pageSize, t, memberFilterOptions]);

    const handleGlobalRenderCell = useCallback(
        (value: any, item: CustomerListDto, column: TableColumn, rowIndex: number) => {
            const content = column.cellRender
                ? column.cellRender({ value, item, column, rowIndex })
                : value;
            return column.align ? <div style={{ textAlign: column.align }}>{content}</div> : content;
        },
        []
    );

    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            <BaseTable<CustomerListDto>
                data={customers}
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
                    <div className="flex justify-between items-center w-full mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                                {t("title")}
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">{t("description")}</p>
                        </div>
                        <PermissionGuard permission={Permissions.CreateAccount}>
                            <Button
                                onClick={handleCreate}
                                variant="outline"
                                className="shadow-md"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                {t("addNew")}
                            </Button>
                        </PermissionGuard>
                    </div>
                )}
                renderCell={handleGlobalRenderCell}
                renderActionColumn={(item) => (
                    <CustomerActions
                        customer={item}
                        onView={handleView}
                        onEdit={handleEdit}
                    />
                )}
            />
        </div>
    );
};

export default function CustomerListPage() {
    return (
        <ProtectedRoute permission={Permissions.ViewAccount}>
            <Suspense fallback={
                <div className="flex h-screen items-center justify-center">
                    <Loader2 className="animate-spin text-gray-400" />
                </div>
            }>
                <CustomerListContent />
            </Suspense>
        </ProtectedRoute>
    );
}