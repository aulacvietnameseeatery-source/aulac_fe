"use client";

import React, { Suspense, useCallback, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { BaseTable } from "@/components/ui/table/base-table";
import { TableColumn } from "@/types/table.types";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { ConfirmModal } from "@/components/layout/admin-sidebar/confirm-modal";
import { ProtectedRoute } from '@/components/protected-route';
import { Permissions } from '@/types/const';
import { Pagination } from "@/components/ui/pagination";

// Dish Feature Imports
import { Badge } from "@/components/ui/badge";
import { useDishList } from "@/features/staff/dish-management/hooks/use-dish-list";
import { DishManagementDto, DishStatusCode } from "@/features/staff/dish-management/types/dish-types";
import { DishHeader } from "@/features/staff/dish-management/components/dish-header";
import { DishActions } from "@/features/staff/dish-management/components/dish-actions";

const DishListContent = () => {
    const t = useTranslations("Dish.List");

    // Logic Hook cho Dish - Lấy cả filterOptions từ hook
    const { dishes, isLoading, pagination, filters, filterOptions, actions } = useDishList();

    // ---- Dish Dialog state ----
    const [dialogState, setDialogState] = useState({
        open: false,
        mode: "view" as "view" | "edit" | "create",
        dishId: null as number | null,
    });

    const openDialog = (mode: "view" | "edit" | "create", dishId: number | null = null) => {
        setDialogState({ open: true, mode, dishId });
    };

    const closeDialog = () => {
        setDialogState({ open: false, mode: "view", dishId: null });
    };

    // State cho Modal Xóa
    const [deleteModal, setDeleteModal] = useState({
        open: false,
        dish: null as DishManagementDto | null,
        isLoading: false,
    });

    // Action Handlers
    const handleView = (dish: DishManagementDto) => openDialog("view", dish.dishId);
    const handleEdit = (dish: DishManagementDto) => openDialog("edit", dish.dishId);
    const handleCreate = () => openDialog("create");

    const handleDeleteClick = (dish: DishManagementDto) => {
        setDeleteModal({ open: true, dish, isLoading: false });
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.dish) return;
        setDeleteModal(prev => ({ ...prev, isLoading: true }));
        try {
            // await dishService.deleteDish(deleteModal.dish.dishId);
            toast.success(t("notifications.deleteSuccess"));
            actions.refresh();
            setDeleteModal({ open: false, dish: null, isLoading: false });
        } catch (error: any) {
            toast.error(error.message || t("notifications.deleteError"));
            setDeleteModal(prev => ({ ...prev, isLoading: false }));
        }
    };

    const handlePaginationChange = useCallback((page: number, pageSize: number) => {
        if (page !== pagination.pageIndex) actions.onPageChange(page);
        if (pageSize !== pagination.pageSize) actions.onPageSizeChange(pageSize);
    }, [pagination.pageIndex, pagination.pageSize, actions]);

    // Status Badge Render sử dụng component UI Badge mới cập nhật
    const renderStatusBadge = (statusId: number, statusName: string) => {
        // Map ID sang Variant của Badge
        let variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" = "outline";

        switch (statusId) {
            case 42: // AVAILABLE (Map cứng ID từ DB hoặc dùng Enum nếu có)
                variant = "success";
                break;
            case 43: // OUT_OF_STOCK
                variant = "warning";
                break;
            case 44: // HIDDEN
                variant = "secondary";
                break;
            default:
                variant = "outline";
        }

        return <Badge variant={variant} className="font-bold">{statusName}</Badge>;
    };

    // Table Columns Config
    const columns: TableColumn[] = useMemo(() => [
        {
            field: 'no',
            header: t('table.no'),
            width: '70px',
            align: 'center',
            cellRender: ({ rowIndex }) =>
                (pagination.pageIndex - 1) * pagination.pageSize + rowIndex + 1,
        },
        {
            field: 'dishName',
            header: t('table.dishName'),
            width: '250px',
            cellRender: ({ value, item }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{value}</span>
                    {item.isOnline && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online
                        </span>
                    )}
                </div>
            )
        },
        {
            field: 'categoryName',
            header: t('table.category'),
            width: '150px',
            cellRender: ({ value }) => <span className="text-gray-600">{value}</span>
        },
        {
            field: 'price',
            header: t('table.price'),
            width: '120px',
            align: 'right',
            cellRender: ({ value }) => (
                <span className="font-bold text-blue-600">
                    ${typeof value === 'number' ? value.toFixed(2) : value}
                </span>
            ),
        },
        {
            field: 'status', // Trường này map với 'status' (text) trong DTO
            header: t('table.status'),
            align: 'center',
            width: '130px',
            // Sử dụng item.statusId (ID) để quyết định màu, và value (Text) để hiển thị
            cellRender: ({ value, item }) => renderStatusBadge(item.statusId, value),
        },
    ], [pagination.pageIndex, pagination.pageSize, t]);

    const handleGlobalRenderCell = useCallback((field: string, value: any, item: DishManagementDto, column: TableColumn, rowIndex: number) => {
        const content = column.cellRender
            ? column.cellRender({ value, item, column, rowIndex })
            : value;

        return column.align ? <div style={{ textAlign: column.align }}>{content}</div> : content;
    }, []);

    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            {/* Header: Filter & Search */}
            <div className="shrink-0 p-6 pb-4 bg-white shadow-sm rounded-lg bg-gray-50/50">
                <DishHeader
                    searchTerm={filters.search}
                    isLoading={isLoading}
                    onSearchChange={actions.onSearchChange}
                    onCreateClick={handleCreate}

                    // Filter Values
                    category={filters.category}
                    status={filters.status}

                    // Filter Options (Dynamic from API via Hook)
                    categories={filterOptions.categories}
                    statuses={filterOptions.statuses}
                    isLoadingFilters={filterOptions.isLoading}

                    // Handlers
                    onCategoryChange={actions.onCategoryChange}
                    onStatusChange={actions.onStatusChange}
                />
            </div>

            {/* Main Table */}
            <div className="flex-1 mt-4 overflow-hidden">
                <BaseTable<DishManagementDto>
                    data={dishes}
                    loading={isLoading}
                    columns={columns}
                    rowKey="dishId"
                    // Truyền props pagination vào BaseTable nếu nó hỗ trợ hiển thị footer
                    // total={pagination.totalCount}
                    // pageIndex={pagination.pageIndex}
                    // pageSize={pagination.pageSize}
                    // onPageChange={actions.onPageChange}
                    // onPageSizeChange={actions.onPageSizeChange}

                    onRefresh={actions.refresh}
                    renderCell={handleGlobalRenderCell}
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

            {/* Pagination Footer */}
            <div className="flex-shrink-0 px-6 py-4 md:px-8 border-t bg-white">
                <Pagination
                    current={pagination.pageIndex}
                    pageSize={pagination.pageSize}
                    total={pagination.totalCount}
                    onChange={handlePaginationChange}
                    pageSizeOptions={[10, 20, 50]}
                />
            </div>

            {/* Dialogs & Modals */}
            {/* <DishDialog ... /> */}

            <ConfirmModal
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, dish: null, isLoading: false })}
                onConfirm={handleConfirmDelete}
                title={t("deleteModal.title")}
                message={t("deleteModal.message", { name: deleteModal.dish?.dishName ?? "" })}
                confirmText={t("deleteModal.confirm")}
                cancelText={t("deleteModal.cancel")}
                variant="danger"
                isLoading={deleteModal.isLoading}
            />
        </div>
    );
};

export default function DishListPage() {
    return (
        <ProtectedRoute permission={Permissions.ViewDish}>
            <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-gray-400" /></div>}>
                <DishListContent />
            </Suspense>
        </ProtectedRoute>
    );
}