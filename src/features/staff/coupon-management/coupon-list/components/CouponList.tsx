"use client";

import React, { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BaseTable } from "@/components/ui/table/base-table";
import { TableColumn } from "@/types/table.types";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { CouponHeader } from './CouponHeader';
import { CouponActions } from './CouponActions';
import { useCouponList } from '../hooks/useCouponList';
import { CouponDTO, CouponDetailDto } from '../types/coupon.types';
import { Badge } from "@/components/ui/badge";
import { ConfirmModal } from "@/components/layout/admin-sidebar/confirm-modal";
import { CouponModal, CouponFormData } from '../../components/coupon-modal';
import { couponListService } from '../services/coupon-list-service';

export default function CouponList() {
  const router = useRouter();
  const t = useTranslations("Coupon.List");
  const tAdd = useTranslations("Coupon.Add");
  const tEdit = useTranslations("Coupon.Edit");
  
  // Logic Hook
  const { coupons, isLoading, totalCount, paginationInfo, onDataChange, refresh } = useCouponList();

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<CouponDTO | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Coupon modal state
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [couponModalMode, setCouponModalMode] = useState<"add" | "edit" | "view">("add");
  const [selectedCoupon, setSelectedCoupon] = useState<CouponDetailDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Action Handlers
  const handleView = async (coupon: CouponDTO) => {
    setIsLoadingDetail(true);
    try {
      const detail = await couponListService.getCouponById(coupon.couponId);
      setSelectedCoupon(detail);
      setCouponModalMode("view");
      setCouponModalOpen(true);
    } catch (error: any) {
      console.error('Failed to load coupon details:', error);
      toast.error(error.response?.data?.userMessage || "Failed to load coupon details");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleEdit = async (coupon: CouponDTO) => {
    setIsLoadingDetail(true);
    try {
      const detail = await couponListService.getCouponById(coupon.couponId);
      setSelectedCoupon(detail);
      setCouponModalMode("edit");
      setCouponModalOpen(true);
    } catch (error: any) {
      console.error('Failed to load coupon details:', error);
      toast.error(error.response?.data?.userMessage || "Failed to load coupon details");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCreate = () => {
    setSelectedCoupon(null);
    setCouponModalMode("add");
    setCouponModalOpen(true);
  };

  const handleDeleteClick = (coupon: CouponDTO) => {
    setCouponToDelete(coupon);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!couponToDelete) return;
    
    setIsDeleting(true);
    try {
      await couponListService.deleteCoupon(couponToDelete.couponId);
      toast.success(t("notifications.deleteSuccess"));
      refresh();
      setDeleteModalOpen(false);
    } catch (error: any) {
      console.error('Failed to delete coupon:', error);
      const errorMessage = error.response?.data?.userMessage || t("notifications.deleteError");
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setCouponToDelete(null);
    }
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setCouponToDelete(null);
  };

  const handleCloseCouponModal = () => {
    setCouponModalOpen(false);
    setSelectedCoupon(null);
  };

  const handleSubmitCoupon = async (formData: CouponFormData) => {
    setIsSubmitting(true);
    try {
      if (couponModalMode === "add") {
        await couponListService.createCoupon({
          couponCode: formData.couponCode.trim(),
          couponName: formData.couponName.trim(),
          description: formData.description.trim() || undefined,
          startTime: formData.startTime,
          endTime: formData.endTime,
          discountValue: formData.discountValue,
          maxUsage: formData.maxUsage,
          type: formData.type,
          couponStatus: formData.couponStatus,
        });
        toast.success(tAdd("notifications.createSuccess"));
      } else if (couponModalMode === "edit" && selectedCoupon) {
        await couponListService.updateCoupon(selectedCoupon.couponId, {
          couponCode: formData.couponCode.trim(),
          couponName: formData.couponName.trim(),
          description: formData.description.trim() || undefined,
          startTime: formData.startTime,
          endTime: formData.endTime,
          discountValue: formData.discountValue,
          maxUsage: formData.maxUsage,
          type: formData.type,
          couponStatus: formData.couponStatus,
        });
        toast.success(tEdit("notifications.updateSuccess"));
      }
      
      refresh();
      handleCloseCouponModal();
    } catch (error: any) {
      console.error('Failed to save coupon:', error);
      const data = error.response?.data;
      const validateInfo: string[] = data?.validateInfo ?? [];
      const baseMessage = data?.userMessage ||
        (couponModalMode === "add" ? tAdd("notifications.createError") : tEdit("notifications.updateError"));
      toast.error(baseMessage, validateInfo.length > 0 ? { description: validateInfo.join(' | ') } : undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status badge renderer
  const renderStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      ACTIVE: { label: t("status.active"), variant: "default" },
      DISABLED: { label: t("status.disabled"), variant: "secondary" },
      SCHEDULED: { label: t("status.scheduled"), variant: "outline" },
      EXPIRED: { label: t("status.expired"), variant: "destructive" },
    };

    const config = statusConfig[status] || { label: status, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Type badge renderer
  const renderTypeBadge = (type: string) => {
    const typeConfig: Record<string, { label: string; className: string }> = {
      FIXED_AMOUNT: { label: t("type.fixedAmount"), className: "bg-blue-100 text-blue-800" },
      PERCENT: { label: t("type.percent"), className: "bg-green-100 text-green-800" },
    };

    const config = typeConfig[type] || { label: type, className: "bg-gray-100 text-gray-800" };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' });
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
      field: 'couponCode',
      header: t("table.code"),
      sortable: false,
      width: '150px',
      filterType: 'text' as const,
      cellRender: ({ value }) => <span className="font-mono font-semibold">{value}</span>,
    },
    {
      field: 'couponName',
      header: t("table.name"),
      sortable: false,
      width: '200px',
      filterType: 'text' as const,
      cellRender: ({ item }) => {
        const coupon = item as CouponDTO;
        return (
          <div className="leading-tight">
            <div className="font-medium text-gray-900">{coupon.couponName}</div>
            {coupon.customerName && (
              <div className="mt-1 text-xs text-gray-500">{coupon.customerName}</div>
            )}
          </div>
        );
      },
    },
    {
      field: 'type',
      header: t("table.type"),
      sortable: false,
      width: '120px',
      align: 'center',
      cellRender: ({ value }) => renderTypeBadge(value),
    },
    {
      field: 'discountValue',
      header: t("table.discountValue"),
      sortable: false,
      width: '120px',
      align: 'right',
      cellRender: ({ value, item }) => {
        const coupon = item as CouponDTO;
        if (coupon.type === 'PERCENT') {
          return `${value}%`;
        } else {
          const formatted = Number(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
          return `${formatted} CHF`;
        }
      },
    },
    {
      field: 'startTime',
      header: t("table.startTime"),
      sortable: false,
      width: '120px',
      cellRender: ({ value }) => formatDate(value),
    },
    {
      field: 'endTime',
      header: t("table.endTime"),
      sortable: false,
      width: '120px',
      cellRender: ({ value }) => formatDate(value),
    },
    {
      field: 'usedCount',
      header: t("table.usage"),
      sortable: false,
      width: '120px',
      align: 'center',
      cellRender: ({ item }) => {
        const coupon = item as CouponDTO;
        return `${coupon.usedCount || 0}${coupon.maxUsage ? `/${coupon.maxUsage}` : ''}`;
      },
    },
    {
      field: 'couponStatus',
      header: t("table.status"),
      sortable: false,
      width: '120px',
      align: 'center',
      cellRender: ({ value }) => renderStatusBadge(value),
    },
  ], [paginationInfo.page, paginationInfo.pageSize, t]);

  const handleGlobalRenderCell = useCallback((
    value: any, 
    item: CouponDTO, 
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
        <BaseTable<CouponDTO>
          data={coupons}
          loading={isLoading}
          columns={columns}
          rowKey="couponId"
          total={totalCount}
          onDataChange={onDataChange}
          onRefresh={refresh}
          searchPlaceholder={t("searchPlaceholder")}
          defaultRowsPerPage={10}
          rowsPerPageOptions={[10, 20, 50, 100]}
          renderTitle={() => (
            <CouponHeader onCreateClick={handleCreate} />
          )}
          renderCell={handleGlobalRenderCell}
          renderActionColumn={(item) => (
            <CouponActions 
              coupon={item}
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
        message={t("deleteModal.message", { name: couponToDelete?.couponCode || "" })}
        confirmText={t("deleteModal.confirm")}
        cancelText={t("deleteModal.cancel")}
        isLoading={isDeleting}
        variant="danger"
      />

      {/* Coupon Add/Edit/View Modal */}
      <CouponModal
        isOpen={couponModalOpen}
        mode={couponModalMode}
        coupon={selectedCoupon}
        onClose={handleCloseCouponModal}
        onSubmit={handleSubmitCoupon}
        onEdit={() => setCouponModalMode("edit")}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
