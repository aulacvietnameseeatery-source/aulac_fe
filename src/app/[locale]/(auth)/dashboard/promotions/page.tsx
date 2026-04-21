"use client";

import React, { Suspense, useCallback, useMemo, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { BaseTable } from "@/components/ui/table/base-table";
import { TableColumn } from "@/types/table.types";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { ProtectedRoute } from "@/components/protected-route";
import { PermissionGuard } from "@/components/permission-guard";
import { Permissions } from "@/types/const";
import { ALTitleCard } from "@/components/ui/al-title-card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "@/routing"

import { usePromotionList } from "@/features/staff/promotion-management/promotion-list/hooks/use-promotion-list";
import { PromotionListDTO } from "@/features/staff/promotion-management/promotion-list/types/promotion-types";
import { PromotionActions } from "@/features/staff/promotion-management/promotion-list/components/promotion-actions";
import { staffPromotionService } from "@/features/staff/promotion-management/promotion-list/services/promotion-service";
import { dateUtils } from "@/lib/date-utils";
import { CreatePromotionDialog } from "@/features/staff/promotion-management/promotion-create-edit/components/create-promotion-dialogs";
import { EditPromotionDialog } from "@/features/staff/promotion-management/promotion-create-edit/components/edit-promotion-dialogs";
import { PromotionDetailDialog } from "@/features/staff/promotion-management/promotion-create-edit/components/promotion-detail-dialog";
import { PromotionStatusCode } from "@/types/status-codes";
import { ConfirmModal } from "@/components/layout/admin-sidebar/confirm-modal";

const PromotionListContent = () => {
    const t = useTranslations("Promotion.List");
    const router = useRouter();

    const { promotions, isLoading, totalCount, paginationInfo, onDataChange, refresh, updatePromotionLocally } = usePromotionList();
    const [togglingId, setTogglingId] = useState<number | null>(null);

    // States cho Dialogs
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editPromoId, setEditPromoId] = useState<number | null>(null);
    const [detailPromoId, setDetailPromoId] = useState<number | null>(null);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [promoToDelete, setPromoToDelete] = useState<PromotionListDTO | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleView = (promo: PromotionListDTO) => {
        setDetailPromoId(promo.promotionId);
    };

    // Mở Dialog Create
    const handleCreate = () => setIsCreateOpen(true);
    
    // Mở Dialog Edit với ID tương ứng
    const handleEdit = (promo: PromotionListDTO) => setEditPromoId(promo.promotionId);

    // THÊM: Xử lý click button delete
    const handleDeleteClick = (promo: PromotionListDTO) => {
        setPromoToDelete(promo);
        setDeleteModalOpen(true);
    };

    // THÊM: Xử lý confirm delete
    const handleConfirmDelete = async () => {
        if (!promoToDelete) return;
        
        setIsDeleting(true);
        try {
            await staffPromotionService.deletePromotion(promoToDelete.promotionId);
            toast.success(t("notifications.deleteSuccess") || "Promotion deleted successfully");
            refresh();
            setDeleteModalOpen(false);
        } catch (error: any) {
            console.error('Failed to delete promotion:', error);
            const errorMessage = error.response?.data?.userMessage || t("notifications.deleteError") || "Failed to delete promotion";
            toast.error(errorMessage);
        } finally {
            setIsDeleting(false);
            setPromoToDelete(null);
        }
    };

    // THÊM: Xử lý close delete modal
    const handleCloseDeleteModal = () => {
        setDeleteModalOpen(false);
        setPromoToDelete(null);
    };

    // Xử lý sau khi lưu thành công từ Dialog
    const handleDialogSuccess = () => {
        setIsCreateOpen(false);
        setEditPromoId(null);
        refresh();
    };

    const handleStatusToggle = async (promo: PromotionListDTO, checked: boolean) => {
        setTogglingId(promo.promotionId);
        try {
            const newStatus = checked ? PromotionStatusCode.ACTIVE : PromotionStatusCode.DISABLED;
            updatePromotionLocally({ ...promo, promotionStatus: newStatus });

            // API calls rely on state checked.
            if (checked) {
                await staffPromotionService.activatePromotion(promo.promotionId);
            } else {
                await staffPromotionService.disablePromotion(promo.promotionId);
            }
            
            toast.success(t("notifications.statusUpdated"));
            refresh(); 
        } catch (error: any) {
            console.error("Update status failed:", error);
            toast.error(error.response?.data?.userMessage || t("notifications.statusUpdateError"));
            refresh(); // Revert on failure
        } finally {
            setTogglingId(null);
        }
    };

    const getComputedStatus = useCallback((item: PromotionListDTO) => {
        if (item.promotionStatus === PromotionStatusCode.DISABLED) return PromotionStatusCode.DISABLED;

        // 1. Get the current time in Swiss time using dateUtils.
        const now = dateUtils.getSwissNow().getTime();

        // 2. Parse the start and end times of BE (UTC) to a timestamp.
        const start = new Date(getUtcDateString(item.startTime)).getTime();
        const end = new Date(getUtcDateString(item.endTime)).getTime();

        // 3. Compare
        if (now < start) return PromotionStatusCode.SCHEDULED;
        if (now > end) return PromotionStatusCode.EXPIRED;
        return PromotionStatusCode.ACTIVE;
    }, []);

    // Ensures the date string from the backend is always UTC.
    const getUtcDateString = (utcDateString: string) => {
        const dateStringWithZ = utcDateString.endsWith('Z') ? utcDateString : `${utcDateString}Z`;
        return dateStringWithZ;
    };

    const columns: TableColumn[] = useMemo(() => [
        {
            field: "no",
            header: t("table.no"),
            width: "70px",
            align: "center" as const,
            sortable: false,
            cellRender: ({ rowIndex }: { rowIndex: number }) =>
                (paginationInfo.page - 1) * paginationInfo.pageSize + rowIndex + 1,
        },
        {
            field: "promoCode",
            header: t("table.promoCode"),
            width: "150px",
            filterType: "text" as const,
            cellRender: ({ value, item }: { value: any; item: PromotionListDTO }) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 tracking-wider">{value}</span>
                    <span className="text-xs text-gray-500">{item.promoName}</span>
                </div>
            ),
        },
        {
            field: "discountValue",
            header: t("table.discount"),
            width: "150px",
            align: "right" as const,
            cellRender: ({ item }: { item: PromotionListDTO }) => {
                if (item.type === "PERCENT") {
                    return <span className="font-bold text-green-600">{item.discountValue}%</span>;
                }
                return <span className="font-bold text-blue-600">{new Intl.NumberFormat('fr-CH', { style: 'currency', currency: 'CHF' }).format(item.discountValue)}</span>;
            },
        },
        {
            field: "startTime",
            header: t("table.startTime"),
            width: "160px",
            cellRender: ({ item }: { item: PromotionListDTO }) => (
                <span className="text-sm text-gray-600">
                    {dateUtils.formatLocal(getUtcDateString(item.startTime), "dd/MM/yyyy HH:mm")}
                </span>
            ),
        },
        {
            field: "endTime",
            header: t("table.endTime"),
            width: "160px",
            cellRender: ({ item }: { item: PromotionListDTO }) => (
                <span className="text-sm text-gray-600">
                    {dateUtils.formatLocal(getUtcDateString(item.endTime), "dd/MM/yyyy HH:mm")}
                </span>
            ),
        },
        {
            field: "usage",
            header: t("table.usage"),
            width: "120px",
            align: "center" as const,
            cellRender: ({ item }: { item: PromotionListDTO }) => (
                <span className="text-sm">
                    {item.usedCount} / {item.maxUsage === null ? "∞" : item.maxUsage}
                </span>
            ),
        },
        {
            field: "promotionStatus",
            header: t("table.status"),
            align: "center" as const,
            width: "130px",
            filterType: "select" as const,
            filterOptions: [
                { label: "Active", value: PromotionStatusCode.ACTIVE },
                { label: "Scheduled", value: PromotionStatusCode.SCHEDULED },
                { label: "Disabled", value: PromotionStatusCode.DISABLED },
                { label: "Expired", value: PromotionStatusCode.EXPIRED },
            ],
            cellRender: ({ item }: { item: PromotionListDTO }) => {
                const computedStatus = getComputedStatus(item);
                // Only turn on the switch if it is currently active or scheduled.
                const isChecked = computedStatus === PromotionStatusCode.ACTIVE || computedStatus === PromotionStatusCode.SCHEDULED;
                const isDisabledStatus = computedStatus === PromotionStatusCode.EXPIRED;
                
                return (
                    <div className="flex flex-col items-center gap-1 py-2">
                        <Switch
                            checked={isChecked}
                            onChange={(checked) => handleStatusToggle(item, checked)}
                            disabled={togglingId === item.promotionId || isDisabledStatus}
                            showLabel={false}
                        />
                        <span className="text-[10px] uppercase text-gray-500 font-semibold">
                            {computedStatus}
                        </span>
                    </div>
                );
            },
        },
    ], [paginationInfo.page, paginationInfo.pageSize, t, togglingId]);

    const handleGlobalRenderCell = useCallback(
        (value: any, item: PromotionListDTO, column: TableColumn, rowIndex: number) => {
            const content = column.cellRender
                ? column.cellRender({ value, item, column, rowIndex })
                : value;
            return column.align ? <div style={{ textAlign: column.align }}>{content}</div> : content;
        },
        []
    );

    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            <BaseTable<PromotionListDTO>
                data={promotions}
                loading={isLoading}
                columns={columns}
                rowKey="promotionId"
                total={totalCount}
                onDataChange={onDataChange}
                onRefresh={refresh}
                searchPlaceholder={t("searchPlaceholder")}
                defaultRowsPerPage={10}
                rowsPerPageOptions={[10, 20, 50]}
                renderTitle={() => (
                    <ALTitleCard
                        title={t("title")}
                        description={t("description")}
                        actions={
                            <PermissionGuard permission={Permissions.CreatePromotion}>
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
                    <PromotionActions promotion={item} onView={handleView} onEdit={handleEdit} onDelete={handleDeleteClick} />
                )}
            />

            {/* --- Dialog Components --- */}
            <PromotionDetailDialog 
                id={detailPromoId}
                open={!!detailPromoId}
                onClose={() => setDetailPromoId(null)}
            />

            <CreatePromotionDialog 
                open={isCreateOpen} 
                onClose={() => setIsCreateOpen(false)} 
                onSuccess={handleDialogSuccess} 
            />

            <EditPromotionDialog 
                id={editPromoId} 
                open={!!editPromoId} 
                onClose={() => setEditPromoId(null)} 
                onSuccess={handleDialogSuccess} 
            />

            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                title={t("deleteModal.title") || "Confirm Delete"}
                message={t("deleteModal.message", { name: promoToDelete?.promoCode || "" }) || `Are you sure you want to delete promotion ${promoToDelete?.promoCode}?`}
                confirmText={t("deleteModal.confirm") || "Delete"}
                cancelText={t("deleteModal.cancel") || "Cancel"}
                isLoading={isDeleting}
                variant="danger"
            />
        </div>
    );
};

export default function PromotionListPage() {
    return (
        <ProtectedRoute permission={Permissions.ViewPromotion}>
            <Suspense
                fallback={
                    <div className="flex h-screen items-center justify-center">
                        <Loader2 className="animate-spin text-gray-400" />
                    </div>
                }
            >
                <PromotionListContent />
            </Suspense>
        </ProtectedRoute>
    );
}