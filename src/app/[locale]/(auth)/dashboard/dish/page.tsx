"use client";

import React, { Suspense, useCallback, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { BaseTable } from "@/components/ui/table/base-table";
import { TableColumn } from "@/types/table.types";
import { useTranslations } from "next-intl";
import { Pagination } from "@/components/ui/pagination";
import { ProtectedRoute } from '@/components/protected-route';
import { Permissions } from '@/types/const';
import { toast } from "sonner";

// --- Dish Feature Imports ---
import { DishManagementDto, DishStatusCode } from "@/features/staff/dish-management/types/dish-types";
import { useDishList } from "@/features/staff/dish-management/hooks/use-dish-list";
import { ConfirmModal } from "@/components/layout/admin-sidebar/confirm-modal";
import {DishHeader} from "@/features/staff/dish-management/components/dish-header";
import {DishActions} from "@/features/staff/dish-management/components/dish-actions";

// (Giả sử bạn sẽ tạo các file này sau để xử lý Detail/Create)
// import { DishDialog } from "@/features/staff/dish-management/components/DishDialog";

const DishListContent = () => {
    const t = useTranslations("Dish.List");

    // 1. Logic Hook - Lấy toàn bộ data và hành động từ useDishList
    const { dishes, isLoading, pagination, filters, actions } = useDishList();

    // 2. State cho Dialog (Create/Edit/View)
    const [dialogState, setDialogState] = useState<{
        open: boolean;
        mode: "view" | "edit" | "create";
        dishId: number | null;
    }>({
        open: false,
        mode: "view",
        dishId: null,
    });

    // 3. State cho Modal Xóa
    const [deleteModal, setDeleteModal] = useState({
        open: false,
        dish: null as DishManagementDto | null,
        loading: false
    });

    // --- Action Handlers ---
    const handleView = (dish: DishManagementDto) =>
        setDialogState({ open: true, mode: "view", dishId: dish.dishId });

    const handleEdit = (dish: DishManagementDto) =>
        setDialogState({ open: true, mode: "edit", dishId: dish.dishId });

    const handleCreate = () =>
        setDialogState({ open: true, mode: "create", dishId: null });

    const handleDeleteClick = (dish: DishManagementDto) =>
        setDeleteModal({ open: true, dish, loading: false });

    const handleConfirmDelete = async () => {
        if (!deleteModal.dish) return;
        setDeleteModal(prev => ({ ...prev, loading: true }));
        try {
            // await dishService.deleteDish(deleteModal.dish.dishId);
            toast.success(t("notifications.deleteSuccess"));
            actions.refresh();
            setDeleteModal({ open: false, dish: null, loading: false });
        } catch (error: any) {
            toast.error(error.message || t("notifications.deleteError"));
            setDeleteModal(prev => ({ ...prev, loading: false }));
        }
    };

    // --- Status Badge Render (Dựa trên ID 42, 43, 44) ---
    const renderStatusBadge = (statusId: number, statusName: string) => {
        const statusConfig: Record<number, { bg: string; text: string; border: string }> = {
            [DishStatusCode.AVAILABLE]: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
            [DishStatusCode.OUT_OF_STOCK]: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
            [DishStatusCode.HIDDEN]: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
        };

        const config = statusConfig[statusId] || statusConfig[DishStatusCode.HIDDEN];

        return (
            <span className={`${config.bg} ${config.text} px-2 py-1 rounded text-xs font-medium border ${config.border}`}>
                {statusName || "N/A"}
            </span>
        );
    };

    // --- Cấu hình cột hiển thị ---
    const columns: TableColumn[] = useMemo(() => [
        {
            field: 'id',
            header: t('table.no'),
            width: '70px',
            align: 'center',
            cellRender: ({ rowIndex }) => (pagination.pageIndex - 1) * pagination.pageSize + rowIndex + 1,
        },
        {
            field: 'dishName',
            header: t('table.dishName'),
            width: '250px',
            sortable: true,
        },
        {
            field: 'categoryName',
            header: t('table.category'),
            width: '150px',
        },
        {
            field: 'price',
            header: t('table.price'),
            width: '120px',
            align: 'right',
            cellRender: ({ value }) => (
                <span className="font-bold text-blue-600">
                    ${value?.toFixed(2)}
                </span>
            ),
        },
        {
            field: 'status',
            header: t('table.status'),
            align: 'center',
            width: '130px',
            cellRender: ({ value, item }) => renderStatusBadge(item.statusId, value),
        },
        {
            field: 'isOnline',
            header: t('table.online'),
            align: 'center',
            width: '100px',
            cellRender: ({ value }) => (
                <div className={`w-10 h-5 rounded-full relative transition-colors ${value ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${value ? 'right-1' : 'left-1'}`} />
                </div>
            ),
        },
    ], [pagination.pageIndex, pagination.pageSize, t]);

    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            {/* Header Section: Search, Filters, Add Button */}
            <div className="shrink-0 p-6 pb-4 bg-white shadow-sm rounded-lg bg-gray-50/50">
                <DishHeader
                    searchTerm={filters.search}
                    isLoading={isLoading}
                    onSearchChange={actions.onSearchChange}
                    onCreateClick={handleCreate}
                    category={filters.category}
                    status={filters.status}
                    // Giả sử lấy categories từ API hoặc hardcode tạm
                    categories={["Traditional Pho", "Appetizer", "Drinks"]}
                    isLoadingFilters={false}
                    onCategoryChange={actions.onCategoryChange}
                    onStatusChange={actions.onStatusChange}
                />
            </div>

            {/* Table Section */}
            <div className="flex-1 mt-4">
                <BaseTable<DishManagementDto>
                    data={dishes}
                    loading={isLoading}
                    columns={columns}
                    rowKey="dishId"
                    total={pagination.totalCount}
                    onRefresh={actions.refresh}
                    renderActionColumn={(item) => (
                        <DishActions
                            dish={item}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDeleteClick}
                        />
                    )}
                />
            </div>

            {/* Pagination Section */}
            <div className="flex-shrink-0 px-6 py-4 border-t bg-white">
                <Pagination
                    current={pagination.pageIndex}
                    pageSize={pagination.pageSize}
                    total={pagination.totalCount}
                    onChange={actions.onPageChange}
                    pageSizeOptions={[10, 20, 50]}
                />
            </div>

            {/* Modal xác nhận xóa */}
            <ConfirmModal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, dish: null, loading: false })}
                onConfirm={handleConfirmDelete}
                title={t("deleteModal.title")}
                message={t("deleteModal.message", { name: deleteModal.dish?.dishName ?? "" })}
                variant="danger"
                isLoading={deleteModal.loading}
            />

            {/* Dish Dialog (Thêm/Sửa/Xem) - Bạn sẽ tích hợp component này sau */}
            {/* <DishDialog
                open={dialogState.open}
                mode={dialogState.mode}
                dishId={dialogState.dishId}
                onClose={() => setDialogState(prev => ({ ...prev, open: false }))}
                onSuccess={actions.refresh}
            /> */}
        </div>
    );
};

export default function DishListPage() {
    return (
        <ProtectedRoute permission={Permissions.ViewDish}>
            <Suspense fallback={
                <div className="flex h-screen items-center justify-center">
                    <Loader2 className="animate-spin text-gray-400" />
                </div>
            }>
                <DishListContent />
            </Suspense>
        </ProtectedRoute>
    );
}