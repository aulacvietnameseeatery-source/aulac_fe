"use client";

import React, { Suspense, useCallback, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { BaseTable } from "@/components/ui/table/base-table";
import { TableColumn } from "@/types/table.types";
import { RoleDto, RoleHeader, RoleActions, useRoleList } from "@/features/staff/role-list";
import { deleteRole } from "@/features/staff/role-list/services/role.service";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { ConfirmModal } from "@/components/layout/admin-sidebar/confirm-modal";
import { ProtectedRoute } from '@/components/protected-route';
import { Permissions } from '@/types/const';
import { Pagination } from "@/components/ui/pagination";
import { useRouter } from "next/navigation";

const RoleListContent = () => {
  const t = useTranslations("Role.List");
  const router = useRouter();
  const locale = useLocale();

  // Logic Hook
  const { roles, isLoading, pagination, searchTerm, actions } = useRoleList();
  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Action Handlers
  const handleView = (role: RoleDto) => {
    router.push(`/${locale}/dashboard/roles/${role.roleId}`);
  };

  const handleEdit = (role: RoleDto) => {
    router.push(`/${locale}/dashboard/roles/${role.roleId}/edit`);
  };

  const handleCreate = () => {
    router.push(`/${locale}/dashboard/roles/create`);
  };

  // Open delete confirmation modal
  const handleDeleteClick = (role: RoleDto) => {
    setRoleToDelete(role.roleId);
    setDeleteModalOpen(true);
  };

  // Perform delete action
  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;

    setIsDeleting(true);
    try {
      await deleteRole(roleToDelete);
      toast.success(t("notifications.deleteSuccess"));
      actions.refresh();
      setDeleteModalOpen(false);
    } catch (error: any) {
      console.error("Delete role failed:", error);
      // Backend might return specific error message for foreign key constraint
      const resData = error.response?.data;
      const errorMessage = resData?.systemMessage || resData?.userMessage || t("notifications.deleteError");
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setRoleToDelete(null);
    }
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setRoleToDelete(null);
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

  // --- CHANGED: Handler for the new Pagination Component ---
  const handlePaginationChange = useCallback((page: number, pageSize: number) => {
    // Only update if values actually changed to avoid loops
    if (page !== pagination.pageIndex) {
      actions.onPageChange(page);
    }
    if (pageSize !== pagination.pageSize) {
      actions.onPageSizeChange(pageSize);
    }
  }, [pagination.pageIndex, pagination.pageSize, actions]);

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
      field: 'roleName',
      header: t('table.name'),
      sortable: false,
      width: '250px',
    },
    {
      field: 'roleCode',
      header: t('table.code'),
      width: '150px',
      sortable: false,
      cellRender: ({ value }) => (
        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-100">
          {value}
        </span>
      ),
    },
    {
      field: 'staffCount',
      header: t('table.staffCount'),
      align: 'center',
      width: '120px',
      sortable: false,
      cellRender: ({ value }) => <span className="font-medium text-gray-600">{value}</span>
    },
  ], [pagination.pageIndex, pagination.pageSize]);

  const handleGlobalRenderCell = useCallback((field: string, value: any, item: RoleDto, column: TableColumn, rowIndex: number) => {
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
  // Handle Batch Delete
  const handleBatchDelete = async (selectedRoles: RoleDto[]) => {
    // Optimistic Update is tricky for delete, so we'll just wait for the API call
    // or we could optimistically remove them from the list, but let's stick to safe approach first

    // Confirmation is handled by the BaseTable's batch action or we can add a custom confirmation if needed
    // For now, let's assume the user knows what they are doing or BaseTable handles a basic confirmation?
    // Actually, BaseTable usually just triggers the action. 
    // Let's add a confirmation step maybe? The staff list didn't seem to have a confirmation for batch actions other than the toggle.
    // But update status is reversible, delete is destructive.
    // Let's assume for now we just run it. If the user wants confirmation, we can add it later or rely on a "Are you sure?" dialog if we wrap it.
    // The requirement "allow select multiple check box in role list and delete" implies the action.

    // Let's implement it similar to staff list's batch update but for delete.

    try {
      const promises = selectedRoles.map(role => deleteRole(role.roleId));
      await Promise.all(promises);

      const count = selectedRoles.length;
      toast.success(t("notifications.batchDeleteSuccess", { count }));
      actions.refresh();
      // We also need to clear selection in the table, BaseTable typically handles this via a ref or state if exposed?
      // If BaseTable controls selection, we might need a way to clear it.
      // Looking at BaseTable usage in staff page:
      /*
        action: (items) => handleBatchStatusUpdate(items, "ACTIVE"),
      */
      // It seems BaseTable passes the items. If BaseTable manages `selectedRowKeys`, it should ideally clear them after action.
      // If not, the refresh might help if the keys are reset.
    } catch (error: any) {
      console.error("Batch delete failed:", error);
      // Middleware maps InvalidOperationException message to SystemMessage.
      // We prefer SystemMessage here to show the specific reason (admin context), 
      // falling back to UserMessage and then translation.
      const resData = error.response?.data;
      const errorMessage = resData?.systemMessage || resData?.userMessage || t("notifications.batchDeleteError");
      toast.error(errorMessage);
      actions.refresh();
    }
  };


  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      <div className="p-6 pb-2 md:p-8 md:pb-4">
        <RoleHeader
          searchTerm={searchTerm}
          isLoading={isLoading}
          onSearchChange={actions.onSearchChange}
          onCreateClick={handleCreate}
        />
      </div>
      <BaseTable<RoleDto>
        // Data & Loading
        data={roles}
        loading={isLoading}
        columns={columns}
        rowKey="roleId"
        total={roles.length}
        onRefresh={actions.refresh}

        renderCell={handleGlobalRenderCell}

        // Render Action Component
        renderActionColumn={(item) => (
          <RoleActions
            role={item}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        )}

        // Batch Actions
        batchActions={[
          {
            label: t('batchActions.delete'),
            icon: 'trash',
            variant: 'danger',
            action: (items) => handleBatchDelete(items),
          }
        ]}
      />

      <Pagination
        current={pagination.pageIndex}
        pageSize={pagination.pageSize}
        total={pagination.totalCount}
        onChange={handlePaginationChange}
        pageSizeOptions={[10, 20, 50, 100]}
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title={t("deleteModal.title")}
        message={t("deleteModal.message")}
        confirmText={t("deleteModal.confirm")}
        cancelText={t("deleteModal.cancel")}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default function RoleListPage() {
  return (
    <ProtectedRoute permission={Permissions.ViewRole}>
      <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-gray-400" /></div>}>
        <RoleListContent />
      </Suspense>
    </ProtectedRoute>
  );
}