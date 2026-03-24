"use client";

import React, { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BaseTable } from "@/components/ui/table/base-table";
import { TableColumn } from "@/types/table.types";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { SupplierHeader } from './SupplierHeader';
import { SupplierActions } from './SupplierActions';
import { useSupplierList } from '../hooks/useSupplierList';
import { listSupplierService } from '../services/listSupplierService';
import { Supplier } from '../types';
import { ConfirmModal } from "@/components/layout/admin-sidebar/confirm-modal";
import { SupplierModal, SupplierFormData } from '../../components/supplier-modal';
import { editSupplierService } from '../../supplier-edit/services/editSupplierService';
import { createSupplierService } from '../../supplier-add/services/createSupplierService';
import { Supplier as SupplierDetail } from '../../supplier-edit/types';

export default function SupplierList() {
  const router = useRouter();
  const t = useTranslations("Supplier.List");
  const tAdd = useTranslations("Supplier.Add");
  const tEdit = useTranslations("Supplier.Edit");
  
  // Logic Hook
  const { suppliers, isLoading, totalCount, paginationInfo, onDataChange, refresh } = useSupplierList();

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Supplier modal state
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [supplierModalMode, setSupplierModalMode] = useState<"add" | "edit" | "view">("add");
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierDetail | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Action Handlers
  const handleView = async (supplier: Supplier) => {
    setIsLoadingDetail(true);
    try {
      const detail = await editSupplierService.getSupplier(supplier.supplierId);
      setSelectedSupplier(detail);
      setSupplierModalMode("view");
      setSupplierModalOpen(true);
    } catch (error: any) {
      console.error('Failed to load supplier details:', error);
      toast.error(error.response?.data?.userMessage || "Failed to load supplier details");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleEdit = async (supplier: Supplier) => {
    setIsLoadingDetail(true);
    try {
      const detail = await editSupplierService.getSupplier(supplier.supplierId);
      setSelectedSupplier(detail);
      setSupplierModalMode("edit");
      setSupplierModalOpen(true);
    } catch (error: any) {
      console.error('Failed to load supplier details:', error);
      toast.error(error.response?.data?.userMessage || "Failed to load supplier details");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCreate = () => {
    setSelectedSupplier(null);
    setSupplierModalMode("add");
    setSupplierModalOpen(true);
  };

  const handleDeleteClick = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!supplierToDelete) return;
    
    setIsDeleting(true);
    try {
      await listSupplierService.deleteSupplier(supplierToDelete.supplierId);
      toast.success(t("notifications.deleteSuccess"));
      refresh();
      setDeleteModalOpen(false);
    } catch (error: any) {
      console.error('Failed to delete supplier:', error);
      const errorMessage = error.response?.data?.userMessage || t("notifications.deleteError");
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setSupplierToDelete(null);
    }
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSupplierToDelete(null);
  };

  const handleCloseSupplierModal = () => {
    setSupplierModalOpen(false);
    setSelectedSupplier(null);
  };

  const handleSubmitSupplier = async (formData: SupplierFormData) => {
    setIsSubmitting(true);
    try {
      if (supplierModalMode === "add") {
        await createSupplierService.createSupplier({
          supplierName: formData.supplierName.trim(),
          phone: formData.phone.trim() || undefined,
          email: formData.email.trim() || undefined,
          address: formData.address.trim() || undefined,
          taxCode: formData.taxCode.trim() || undefined,
          ingredientIds: formData.ingredientIds,
        });
        toast.success(tAdd("notifications.createSuccess"));
      } else if (supplierModalMode === "edit" && selectedSupplier) {
        await editSupplierService.updateSupplier(selectedSupplier.supplierId, {
          supplierName: formData.supplierName.trim(),
          phone: formData.phone.trim() || undefined,
          email: formData.email.trim() || undefined,
          address: formData.address.trim() || undefined,
          taxCode: formData.taxCode.trim() || undefined,
          ingredientIds: formData.ingredientIds,
        });
        toast.success(tEdit("notifications.updateSuccess"));
      }
      
      refresh();
      handleCloseSupplierModal();
    } catch (error: any) {
      console.error('Failed to save supplier:', error);
      const errorMessage = error.response?.data?.userMessage || 
        (supplierModalMode === "add" ? tAdd("notifications.createError") : tEdit("notifications.updateError"));
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Table Columns Config
  const columns: TableColumn[] = useMemo(() => [
    {
      field: 'id',
      header: t("table.no"),
      width: '80px',
      align: 'center',
      sortable: false,
      cellRender: ({ rowIndex }) =>
        (paginationInfo.page - 1) * paginationInfo.pageSize + rowIndex + 1,
    },
    {
      field: 'supplierName',
      header: t("table.name"),
      sortable: false,
      width: '250px',
      filterType: 'text' as const,
    },
    {
      field: 'phone',
      header: t("table.phone"),
      sortable: false,
      width: '180px',
      filterType: 'text' as const,
      cellRender: ({ value }) => value || <span className="text-gray-400 italic">-</span>,
    },
    {
      field: 'email',
      header: t("table.email"),
      sortable: false,
      cellRender: ({ value }) => value || <span className="text-gray-400 italic">-</span>,
    },
    {
      field: 'address',
      header: t("table.address"),
      sortable: false,
      cellRender: ({ value }) => value || <span className="text-gray-400 italic">-</span>,
    },
    {
      field: 'taxCode',
      header: t("table.taxCode"),
      sortable: false,
      width: '150px',
      cellRender: ({ value }) => value || <span className="text-gray-400 italic">-</span>,
    },
  ], [paginationInfo.page, paginationInfo.pageSize, t]);

  const handleGlobalRenderCell = useCallback((
    value: any, 
    item: Supplier, 
    column: TableColumn, 
    rowIndex: number
  ) => {
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
    <>
      <div className="w-full h-full flex flex-col overflow-hidden">
        <BaseTable<Supplier>
          data={suppliers}
          loading={isLoading}
          columns={columns}
          rowKey="supplierId"
          total={totalCount}
          onDataChange={onDataChange}
          onRefresh={refresh}
          searchPlaceholder={t("searchPlaceholder")}
          defaultRowsPerPage={10}
          rowsPerPageOptions={[10, 20, 50, 100]}
          renderTitle={() => (
            <SupplierHeader onCreateClick={handleCreate} />
          )}
          renderCell={handleGlobalRenderCell}
          renderActionColumn={(item) => (
            <SupplierActions 
              supplier={item}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          )}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title={t("deleteModal.title")}
        message={t("deleteModal.message", { name: supplierToDelete?.supplierName || "" })}
        confirmText={t("deleteModal.confirm")}
        cancelText={t("deleteModal.cancel")}
        isLoading={isDeleting}
        variant="danger"
      />

      {/* Supplier Add/Edit/View Modal */}
      <SupplierModal
        isOpen={supplierModalOpen}
        mode={supplierModalMode}
        supplier={selectedSupplier}
        onClose={handleCloseSupplierModal}
        onSubmit={handleSubmitSupplier}
        onEdit={() => setSupplierModalMode("edit")}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
