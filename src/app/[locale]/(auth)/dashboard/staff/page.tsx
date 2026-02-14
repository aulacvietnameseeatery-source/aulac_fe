"use client";

import React, { Suspense, useCallback, useMemo, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { BaseTable } from "@/components/ui/table/base-table";
import { TableColumn } from "@/types/table.types";
import { StaffAccount } from "@/features/staff/account-management/account-list/types/staff-account.types";
import { AccountActions } from "@/features/staff/account-management/account-list/components/AccountActions";
import { useAccountList } from "@/features/staff/account-management/account-list/hooks/useAccountList";
import { useFilterOptions } from "@/features/staff/account-management/account-list/hooks/useFilterOptions";
import { staffAccountService } from "@/features/staff/account-management/account-list/services/staff-account.service";
import { AccountDialog } from "@/features/staff/account-management/account-detail/components/AccountDialog";
import type { AccountDialogMode, AccountDialogState } from "@/features/staff/account-management/account-detail/types/account-detail.types";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { ConfirmModal } from "@/components/layout/admin-sidebar/confirm-modal";
import { ProtectedRoute } from "@/components/protected-route";
import { PermissionGuard } from "@/components/permission-guard";
import { Permissions } from "@/types/const";
import { Button } from "@/components/ui/button";

const AccountListContent = () => {
    const t = useTranslations("Account.List");

    // Data-fetching hook (driven by BaseTable onDataChange)
    const { accounts, isLoading, totalCount, paginationInfo, onDataChange, refresh } =
        useAccountList();

    // Filter options for column filters (roles & statuses from API)
    const { roles, statuses } = useFilterOptions();

    // ---- Account Dialog state ----
    const [dialogState, setDialogState] = useState<AccountDialogState>({
        open: false,
        mode: "view",
        accountId: null,
    });

    const openDialog = (mode: AccountDialogMode, accountId: number | null = null) => {
        setDialogState({ open: true, mode, accountId });
    };
    const closeDialog = () => {
        setDialogState({ open: false, mode: "view", accountId: null });
    };

    // Reset password modal state
    const [resetModalOpen, setResetModalOpen] = useState(false);
    const [accountToReset, setAccountToReset] = useState<number | null>(null);
    const [isResetting, setIsResetting] = useState(false);

    // Action Handlers
    const handleView = (account: StaffAccount) => openDialog("view", account.accountId);
    const handleEdit = (account: StaffAccount) => openDialog("edit", account.accountId);
    const handleCreate = () => openDialog("create");

    const handleResetPasswordClick = (account: StaffAccount) => {
        setAccountToReset(account.accountId);
        setResetModalOpen(true);
    };

    const handleConfirmReset = async () => {
        if (!accountToReset) return;
        setIsResetting(true);
        try {
            await staffAccountService.resetStaffPassword(accountToReset);
            toast.success(t("notifications.resetPasswordSuccess"));
            refresh();
            setResetModalOpen(false);
        } catch (error: any) {
            console.error("Reset password failed:", error);
            const errorMessage =
                error.response?.data?.userMessage || t("notifications.resetPasswordError");
            toast.error(errorMessage);
        } finally {
            setIsResetting(false);
            setAccountToReset(null);
        }
    };

    const handleCloseResetModal = () => {
        setResetModalOpen(false);
        setAccountToReset(null);
    };

    // ---- Column filter options (derived from API data) ----
    const roleFilterOptions = useMemo(
        () => roles.map((r) => ({ label: r.roleName, value: String(r.roleId) })),
        [roles]
    );

    const statusFilterOptions = useMemo(
        () => statuses.map((s) => ({ label: s.valueName, value: String(s.valueId) })),
        [statuses]
    );

    // Status Badge Render
    const renderStatusBadge = (status: number, statusName: string) => {
        const statusConfig: Record<number, { bg: string; text: string; border: string }> = {
            1: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
            2: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" },
            3: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
        };
        const config = statusConfig[status] || statusConfig[2];
        return (
            <span
                className={`${config.bg} ${config.text} px-2 py-1 rounded text-xs font-medium border ${config.border}`}
            >
        {statusName}
      </span>
        );
    };

    // ---- Table Columns with built-in filterType + filterOptions ----
    const columns: TableColumn[] = useMemo(
        () => [
            {
                field: "id",
                header: t("table.no"),
                width: "80px",
                align: "center" as const,
                sortable: false,
                cellRender: ({ rowIndex }: { rowIndex: number }) =>
                    (paginationInfo.page - 1) * paginationInfo.pageSize + rowIndex + 1,
            },
            {
                field: "fullName",
                header: t("table.fullName"),
                sortable: false,
                width: "180px",
                filterType: "text" as const,
            },
            {
                field: "email",
                header: t("table.email"),
                width: "200px",
                sortable: false,
                filterType: "text" as const,
                cellRender: ({ value }: { value: any }) =>
                    value || <span className="text-gray-400 italic">N/A</span>,
            },
            {
                field: "phone",
                header: t("table.phone"),
                width: "130px",
                sortable: false,
                cellRender: ({ value }: { value: any }) =>
                    value || <span className="text-gray-400 italic">N/A</span>,
            },
            {
                field: "roleName",
                header: t("table.role"),
                width: "110px",
                sortable: false,
                filterType: "select" as const,
                filterOptions: roleFilterOptions,
                cellRender: ({ value }: { value: any }) => (
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-100">
            {value}
          </span>
                ),
            },
            {
                field: "accountStatusName",
                header: t("table.status"),
                align: "center" as const,
                width: "110px",
                sortable: false,
                filterType: "select" as const,
                filterOptions: statusFilterOptions,
                cellRender: ({ value, item }: { value: any; item: any }) =>
                    renderStatusBadge(item.accountStatus, value),
            },
        ],
        [paginationInfo.page, paginationInfo.pageSize, t, roleFilterOptions, statusFilterOptions]
    );

    // Global cell renderer (applies column alignment)
    const handleGlobalRenderCell = useCallback(
        (field: string, value: any, item: StaffAccount, column: TableColumn, rowIndex: number) => {
            const content = column.cellRender
                ? column.cellRender({ value, item, column, rowIndex })
                : value;
            if (column.align) {
                return <div style={{ textAlign: column.align }}>{content}</div>;
            }
            return content;
        },
        []
    );

    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            <BaseTable<StaffAccount>
                data={accounts}
                loading={isLoading}
                columns={columns}
                rowKey="accountId"
                total={totalCount}
                onDataChange={onDataChange}
                onRefresh={refresh}
                searchPlaceholder={t("searchPlaceholder")}
                defaultRowsPerPage={10}
                rowsPerPageOptions={[10, 20, 50, 100]}
                renderTitle={() => (
                    <div className="flex justify-between items-center w-full">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                                {t("title")}
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">{t("description")}</p>
                        </div>
                        <PermissionGuard permission={Permissions.CreateAccount}>
                            <Button onClick={handleCreate} variant="outline" className="shadow-md">
                                <Plus className="mr-2 h-4 w-4" />
                                {t("addNew")}
                            </Button>
                        </PermissionGuard>
                    </div>
                )}
                renderCell={handleGlobalRenderCell}
                renderActionColumn={(item) => (
                    <AccountActions
                        account={item}
                        onView={handleView}
                        onEdit={handleEdit}
                        onResetPassword={handleResetPasswordClick}
                    />
                )}
            />

            {/* Account Detail / Create / Edit Dialog */}
            <AccountDialog
                open={dialogState.open}
                mode={dialogState.mode}
                accountId={dialogState.accountId}
                onClose={closeDialog}
                onSuccess={refresh}
            />

            <ConfirmModal
                isOpen={resetModalOpen}
                onClose={handleCloseResetModal}
                onConfirm={handleConfirmReset}
                title={t("resetPasswordModal.title")}
                message={t("resetPasswordModal.message")}
                confirmText={t("resetPasswordModal.confirm")}
                cancelText={t("resetPasswordModal.cancel")}
                variant="warning"
                isLoading={isResetting}
            />
        </div>
    );
};

export default function StaffAccountListPage() {
    return (
        <ProtectedRoute permission={Permissions.ViewAccount}>
            <Suspense
                fallback={
                    <div className="flex h-screen items-center justify-center">
                        <Loader2 className="animate-spin text-gray-400" />
                    </div>
                }
            >
                <AccountListContent />
            </Suspense>
        </ProtectedRoute>
    );
}
