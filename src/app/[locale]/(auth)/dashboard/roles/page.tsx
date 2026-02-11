// src/features/auth/role-list/RoleListPage.tsx
"use client";

import { RoleHeader, RolePagination, RoleTable, RoleToolbar, useRoleList } from "@/features/auth/role-list";
import { Loader2 } from "lucide-react";
import React, { Suspense, useState } from "react";
import { ConfirmModal } from "@/components/layout/admin-sidebar/confirm-modal";
import { deleteRole } from "@/features/auth/role-list/services/role.service";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

// Separate the main logic into child components.
const RoleListContent = () => {
  const t = useTranslations("Role.List");
  const router = useRouter();
  const { roles, isLoading, pagination, searchTerm, actions } = useRoleList();

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleView = (id: number) => {
    router.push(`/dashboard/roles/${id}`);
  };
  
  const handleEdit = (id: number) => {
    router.push(`/dashboard/roles/${id}/edit`);
  };
  
  const handleAdd = () => {
    router.push("/dashboard/roles/create");
  };

  // Open delete confirmation modal
  const handleDeleteClick = (id: number) => {
    setRoleToDelete(id);
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
      const errorMessage = error.response?.data?.userMessage || t("notifications.deleteError");
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

  return (
    <>
      <RoleHeader />

      <RoleToolbar
        initialSearchTerm={searchTerm}
        onSearchChange={actions.onSearchChange}
        onAddClick={handleAdd}
      />

      <RoleTable
        roles={roles}
        isLoading={isLoading}
        startIndex={(pagination.pageIndex - 1) * pagination.pageSize}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <RolePagination
        pageIndex={pagination.pageIndex}
        totalPage={pagination.totalPage}
        pageSize={pagination.pageSize}
        onPageChange={actions.onPageChange}
        onPageSizeChange={actions.onPageSizeChange}
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
    </>
  );
};

// Component Default wraps Suspense
export default function RoleListPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 p-8 font-sans text-gray-900">
      <Suspense fallback={<div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>}>
        <RoleListContent />
      </Suspense>
    </div>
  );
}