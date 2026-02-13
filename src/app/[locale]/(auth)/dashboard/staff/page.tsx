"use client";

import React, { Suspense, useCallback, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { BaseTable } from "@/components/ui/table/base-table"; 
import { TableColumn } from "@/types/table.types"; 
import { StaffAccount } from "@/features/staff/account-management/account-list/types/staff-account.types";
import { AccountHeader } from "@/features/staff/account-management/account-list/components/AccountHeader";
import { AccountActions } from "@/features/staff/account-management/account-list/components/AccountActions";
import { useAccountList } from "@/features/staff/account-management/account-list/hooks/useAccountList";
import { useFilterOptions } from "@/features/staff/account-management/account-list/hooks/useFilterOptions";
import { staffAccountService } from "@/features/staff/account-management/account-list/services/staff-account.service";
import { AccountDialog } from "@/features/staff/account-management/account-detail/components/AccountDialog";
import type { AccountDialogMode, AccountDialogState } from "@/features/staff/account-management/account-detail/types/account-detail.types";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { ConfirmModal } from "@/components/layout/admin-sidebar/confirm-modal";
import { ProtectedRoute } from '@/components/protected-route';
import { Permissions } from '@/types/const';
import { Pagination } from "@/components/ui/pagination";

const AccountListContent = () => {
  const t = useTranslations("Account.List");
  
  // Logic Hook
  const { accounts, isLoading, pagination, filters, actions } = useAccountList();
  
  // Filter Options Hook
  const { roles, statuses, isLoadingFilters } = useFilterOptions();
  
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

  // Action Handlers — open dialog with the correct mode
  const handleView = (account: StaffAccount) => openDialog("view", account.accountId);
  const handleEdit = (account: StaffAccount) => openDialog("edit", account.accountId);
  const handleCreate = () => openDialog("create");

  // Open reset password confirmation modal
  const handleResetPasswordClick = (account: StaffAccount) => {
    setAccountToReset(account.accountId);
    setResetModalOpen(true);
  };

  // Perform reset password action
  const handleConfirmReset = async () => {
    if (!accountToReset) return;

    setIsResetting(true);
    try {
      await staffAccountService.resetStaffPassword(accountToReset);
      toast.success(t("notifications.resetPasswordSuccess"));
      actions.refresh();
      setResetModalOpen(false);
    } catch (error: any) {
      console.error("Reset password failed:", error);
      const errorMessage = error.response?.data?.userMessage || t("notifications.resetPasswordError");
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

  // Data Change Handler (Pagination)
  const handleDataChange = useCallback((params: { page?: number; pageSize?: number }) => {
    if (params.page !== undefined && params.page !== pagination.pageIndex) {
      actions.onPageChange(params.page);
    }
    if (params.pageSize && params.pageSize !== pagination.pageSize) {
      actions.onPageSizeChange(params.pageSize);
    }
  }, [pagination.pageIndex, pagination.pageSize, actions]);

  // Handler for the Pagination Component
  const handlePaginationChange = useCallback((page: number, pageSize: number) => {
    // Only update if values actually changed to avoid loops
    if (page !== pagination.pageIndex) {
      actions.onPageChange(page);
    }
    if (pageSize !== pagination.pageSize) {
      actions.onPageSizeChange(pageSize);
    }
  }, [pagination.pageIndex, pagination.pageSize, actions]);

  // Status Badge Render
  const renderStatusBadge = (status: number, statusName: string) => {
    const statusConfig: Record<number, { bg: string; text: string; border: string }> = {
      1: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' }, // ACTIVE
      2: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },    // INACTIVE
      3: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },       // LOCKED
    };
    
    const config = statusConfig[status] || statusConfig[2];
    
    return (
      <span className={`${config.bg} ${config.text} px-2 py-1 rounded text-xs font-medium border ${config.border}`}>
        {statusName}
      </span>
    );
  };

  // Table Columns Config
  const columns: TableColumn[] = useMemo(() => [
    {
      field: 'id',
      header: t('table.no'),
      width: '80px',
      align: 'center',
      sortable: false,
      cellRender: ({ rowIndex }) =>
        (pagination.pageIndex - 1) * pagination.pageSize + rowIndex + 1,
    },
    {
      field: 'fullName',
      header: t('table.fullName'),
      sortable: false,
      width: '180px',
    },
    {
      field: 'email',
      header: t('table.email'),
      width: '200px',
      sortable: false,
      cellRender: ({ value }) => value || <span className="text-gray-400 italic">N/A</span>,
    },
    {
      field: 'phone',
      header: t('table.phone'),
      width: '130px',
      sortable: false,
      cellRender: ({ value }) => value || <span className="text-gray-400 italic">N/A</span>,
    },
    {
      field: 'roleName',
      header: t('table.role'),
      width: '110px',
      sortable: false,
      cellRender: ({ value }) => (
        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-100">
          {value}
        </span>
      ),
    },
    {
      field: 'accountStatusName',
      header: t('table.status'),
      align: 'center',
      width: '110px',
      sortable: false,
      cellRender: ({ value, item }) => renderStatusBadge(item.accountStatus, value),
    },
  ], [pagination.pageIndex, pagination.pageSize, t]);

  const handleGlobalRenderCell = useCallback((field: string, value: any, item: StaffAccount, column: TableColumn, rowIndex: number) => {
    const content = column.cellRender 
      ? column.cellRender({ value, item, column, rowIndex }) 
      : value;

    if (column.align) {
      return (
        <div style={{ textAlign: column.align }}>
          {content}
        </div>
      );
    }
    return content;
  }, []);

  return (
    <div className="w-full h-full flex flex-col  overflow-hidden">
      <div className="shrink-0 p-6 pb-2 md:pb-4 bg-white shadow-sm rounded-lg bg-gray-50/50">
        <AccountHeader 
          searchTerm={filters.searchTerm}
          isLoading={isLoading}
          onSearchChange={actions.onSearchChange}
          onCreateClick={handleCreate}
          roleId={filters.roleId}
          status={filters.status}
          roles={roles}
          statuses={statuses}
          isLoadingFilters={isLoadingFilters}
          onRoleChange={actions.onRoleChange}
          onStatusChange={actions.onStatusChange}
        />
      </div>
      
      <div className="flex-1">
        <BaseTable<StaffAccount>
          // Data & Loading
          data={accounts}
          loading={isLoading}
          columns={columns}
          rowKey="accountId"
          total={accounts.length}
          onRefresh={actions.refresh}

          renderCell={handleGlobalRenderCell}

          // Render Action Component
          renderActionColumn={(item) => (
            <AccountActions 
              account={item}
              onView={handleView}
              onEdit={handleEdit}
              onResetPassword={handleResetPasswordClick}
            />
          )}
        />
      </div>

      <div className="flex-shrink-0 px-6 py-4 md:px-8 border-t bg-white">
        <Pagination 
          current={pagination.pageIndex}
          pageSize={pagination.pageSize}
          total={pagination.totalCount}
          onChange={handlePaginationChange}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      </div>

      {/* Account Detail / Create / Edit Dialog */}
      <AccountDialog
        open={dialogState.open}
        mode={dialogState.mode}
        accountId={dialogState.accountId}
        onClose={closeDialog}
        onSuccess={actions.refresh}
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
      <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-gray-400" /></div>}>
        <AccountListContent />
      </Suspense>
    </ProtectedRoute>
  );
}
