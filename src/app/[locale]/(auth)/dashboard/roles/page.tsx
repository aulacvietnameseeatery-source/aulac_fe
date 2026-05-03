"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { BaseTable } from "@/components/ui/table/base-table";
import { TableColumn } from "@/types/table.types";
import { RoleDto, RoleActions, useRoleList } from "@/features/staff/role-management/role-list";
import {
  archiveRole,
  getActiveRoles,
  type ActiveRoleOption,
} from "@/features/staff/role-management/role-list/services/role.service";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { ConfirmModal } from "@/components/layout/admin-sidebar/confirm-modal";
import { ProtectedRoute } from "@/components/protected-route";
import { PermissionGuard } from "@/components/permission-guard";
import { Permissions } from "@/types/const";
import { ALTitleCard } from "@/components/ui/al-title-card";
import { Button } from "@/components/ui/button";
import { ALCombobox, type ALComboboxOption } from "@/components/ui/al-combobox";
import { getLocalizedApiErrorMessage } from "@/lib/api-error";
import { useRouter } from "@/routing"

const RoleListContent = () => {
  const t = useTranslations("Role.List");
  const router = useRouter();

  // Data-fetching hook (driven by BaseTable onDataChange)
  const { roles, isLoading, totalCount, paginationInfo, onDataChange, refresh } =
    useRoleList();

  // Archive modal state
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [roleToArchive, setRoleToArchive] = useState<RoleDto | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [replacementRoleId, setReplacementRoleId] = useState<number | "">("");
  const [replacementRoles, setReplacementRoles] = useState<ActiveRoleOption[]>([]);
  const [isLoadingReplacementRoles, setIsLoadingReplacementRoles] = useState(false);
  const [replacementRolesError, setReplacementRolesError] = useState<string | null>(null);

  const requiresReplacementRole = (roleToArchive?.staffCount ?? 0) > 0;

  useEffect(() => {
    if (!archiveModalOpen || !roleToArchive || !requiresReplacementRole) {
      setReplacementRoles([]);
      setReplacementRolesError(null);
      setIsLoadingReplacementRoles(false);
      return;
    }

    let isActive = true;
    setIsLoadingReplacementRoles(true);
    setReplacementRolesError(null);

    getActiveRoles()
      .then((activeRoles) => {
        if (!isActive) return;
        const availableRoles = activeRoles.filter((role) => role.roleId !== roleToArchive.roleId);
        setReplacementRoles(availableRoles);
        if (availableRoles.length === 1) {
          setReplacementRoleId(availableRoles[0].roleId);
        }
      })
      .catch((error) => {
        if (!isActive) return;
        setReplacementRoles([]);
        setReplacementRolesError(
          getLocalizedApiErrorMessage(error, t("notifications.loadReplacementRolesError"))
        );
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingReplacementRoles(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [archiveModalOpen, requiresReplacementRole, roleToArchive, t]);

  const replacementRoleOptions = useMemo<ALComboboxOption[]>(
    () =>
      replacementRoles.map((role) => ({
        label: role.roleName,
        value: role.roleId,
      })),
    [replacementRoles]
  );

  const archiveConfirmDisabled =
    isArchiving ||
    (requiresReplacementRole &&
      (isLoadingReplacementRoles || replacementRoles.length === 0 || replacementRoleId === ""));

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

  const handleArchiveClick = (role: RoleDto) => {
    setRoleToArchive(role);
    setReplacementRoleId("");
    setReplacementRoles([]);
    setReplacementRolesError(null);
    setArchiveModalOpen(true);
  };

  const handleCloseArchiveModal = () => {
    setArchiveModalOpen(false);
    setRoleToArchive(null);
    setReplacementRoleId("");
    setReplacementRoles([]);
    setReplacementRolesError(null);
  };

  const handleConfirmArchive = async () => {
    if (!roleToArchive) return;

    if (requiresReplacementRole && replacementRoleId === "") {
      toast.error(t("deleteModal.replacementRequired"));
      return;
    }

    setIsArchiving(true);
    try {
      await archiveRole(
        roleToArchive.roleId,
        replacementRoleId === "" ? undefined : { replacementRoleId: Number(replacementRoleId) }
      );
      toast.success(t("notifications.deleteSuccess"));
      refresh();
      handleCloseArchiveModal();
    } catch (error: any) {
      console.error("Archive role failed:", error);
      toast.error(getLocalizedApiErrorMessage(error, t("notifications.deleteError")));
    } finally {
      setIsArchiving(false);
    }
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
            onArchive={handleArchiveClick}
          />
        )}
      />

      <ConfirmModal
        isOpen={archiveModalOpen}
        onClose={handleCloseArchiveModal}
        onConfirm={handleConfirmArchive}
        title={t("deleteModal.title")}
        message={t("deleteModal.message")}
        confirmText={t("deleteModal.confirm")}
        cancelText={t("deleteModal.cancel")}
        variant="warning"
        isLoading={isArchiving}
        confirmDisabled={archiveConfirmDisabled}
      >
        {requiresReplacementRole && (
          <div className="mt-2 w-full space-y-3 text-left">
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
              {t("deleteModal.messageWithReplacement", { count: roleToArchive?.staffCount ?? 0 })}
            </div>

            <ALCombobox
              title={t("deleteModal.replacementLabel")}
              required
              options={replacementRoleOptions}
              value={replacementRoleId}
              onChange={(value) => setReplacementRoleId(value === "" ? "" : Number(value))}
              placeholder={t("deleteModal.replacementPlaceholder")}
              isLoading={isLoadingReplacementRoles}
              searchable
              clearable
              inputSize="sm"
            />

            {replacementRolesError && (
              <p className="text-xs text-red-600">{replacementRolesError}</p>
            )}

            {!isLoadingReplacementRoles && !replacementRolesError && replacementRoleOptions.length === 0 && (
              <p className="text-xs text-amber-700">{t("deleteModal.noReplacementRoles")}</p>
            )}
          </div>
        )}
      </ConfirmModal>
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
