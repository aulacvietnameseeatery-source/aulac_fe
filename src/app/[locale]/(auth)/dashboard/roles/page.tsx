"use client";

import React, { Suspense, useCallback, useMemo, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { BaseTable } from "@/components/ui/table/base-table";
import { TableColumn } from "@/types/table.types";
import { RoleDto, RoleActions, useRoleList } from "@/features/staff/role-management/role-list";
import { deleteRole } from "@/features/staff/role-management/role-list/services/role.service";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { ConfirmModal } from "@/components/layout/admin-sidebar/confirm-modal";
import { ProtectedRoute } from "@/components/protected-route";
import { PermissionGuard } from "@/components/permission-guard";
import { Permissions } from "@/types/const";
import { ALTitleCard } from "@/components/ui/al-title-card";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/routing"

const RoleListContent = () => {
  const t = useTranslations("Role.List");
  const router = useRouter();
  const locale = useLocale();

  // Data-fetching hook (driven by BaseTable onDataChange)
  const { roles, isLoading, totalCount, paginationInfo, onDataChange, refresh } =
    useRoleList();

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Action Handlers
  const handleView = (role: RoleDto) => {
    router.push(`/dashboard/roles/${role.roleId}`);
  };
  const handleEdit = (role: RoleDto) => {
    router.push(`/dashboard/roles/${role.roleId}/edit`);
  };
  const handleCreate = () => {
    router.push(`/dashboard/roles/create`);
  };

  const handleDeleteClick = (role: RoleDto) => {
    setRoleToDelete(role.roleId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;
    setIsDeleting(true);
    try {
      await deleteRole(roleToDelete);
      toast.success(t("notifications.deleteSuccess"));
      refresh();
      setDeleteModalOpen(false);
    } catch (error: any) {
      console.error("Delete role failed:", error);
      const status = error.response?.status || error.status;
      const errorMessage = status === 400
        ? t("notifications.deleteHasDependencies")
        : t("notifications.deleteError");
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

  // ---- Table Columns ----
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
        field: "roleName",
        header: t("table.name"),
        sortable: false,
        width: "250px",
        filterType: "text" as const,
      },
      {
        field: "roleCode",
        header: t("table.code"),
        width: "150px",
        sortable: false,
        filterType: "text" as const,
        cellRender: ({ value }: { value: any }) => (
          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-100">
            {value}
          </span>
        ),
      },
      {
        field: "staffCount",
        header: t("table.staffCount"),
        align: "center" as const,
        width: "120px",
        sortable: false,
        cellRender: ({ value }: { value: any }) => (
          <span className="font-medium text-gray-600">{value}</span>
        ),
      },
    ],
    [paginationInfo.page, paginationInfo.pageSize, t]
  );

  // Global cell renderer (applies column alignment)
  const handleGlobalRenderCell = useCallback(
    (value: any, item: RoleDto, column: TableColumn, rowIndex: number) => {
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
    <div className="flex flex-col h-full bg-gray-50/50">
      <BaseTable<RoleDto>
        data={roles}
        loading={isLoading}
        columns={columns}
        rowKey="roleId"
        total={totalCount}
        onDataChange={onDataChange}
        onRefresh={refresh}
        searchPlaceholder={t("searchPlaceholder")}
        defaultRowsPerPage={10}
        rowsPerPageOptions={[10, 20, 50, 100]}
        renderTitle={() => (
          <ALTitleCard
            title={t("title")}
            description={t("description")}
            actions={
              <PermissionGuard permission={Permissions.CreateRole}>
                <Button
                  onClick={handleCreate}
                  className="w-full gap-2 sm:w-auto bg-[#1A3A52] text-[#FDFBF9] hover:bg-[#1A3A52]/90"
                >
                  <Plus className="h-4 w-4" />
                  {t("addNew")}
                </Button>
              </PermissionGuard>
            }
          />
        )}
        renderCell={handleGlobalRenderCell}
        renderActionColumn={(item) => (
          <RoleActions
            role={item}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        )}
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
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center">
            <Loader2 className="animate-spin text-gray-400" />
          </div>
        }
      >
        <RoleListContent />
      </Suspense>
    </ProtectedRoute>
  );
}
