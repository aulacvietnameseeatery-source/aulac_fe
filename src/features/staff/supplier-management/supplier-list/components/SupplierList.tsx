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

export default function SupplierList() {
  const router = useRouter();
  const t = useTranslations("Supplier.List");
  
  // Logic Hook
  const { suppliers, isLoading, totalCount, paginationInfo, onDataChange, refresh } = useSupplierList();

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Action Handlers
  const handleEdit = (supplier: Supplier) => {
    router.push(`/dashboard/suppliers/edit/${supplier.supplierId}`);
  };

  const handleCreate = () => {
    router.push('/dashboard/suppliers/add');
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
    </>
  );
}
