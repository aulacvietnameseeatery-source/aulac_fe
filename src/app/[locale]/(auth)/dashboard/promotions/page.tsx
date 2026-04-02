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

const PromotionListContent = () => {
    const t = useTranslations("Promotion.List");
    const router = useRouter();

    const { promotions, isLoading, totalCount, paginationInfo, onDataChange, refresh, updatePromotionLocally } = usePromotionList();
    const [togglingId, setTogglingId] = useState<number | null>(null);

    // States cho Dialogs
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editPromoId, setEditPromoId] = useState<number | null>(null);
    const [detailPromoId, setDetailPromoId] = useState<number | null>(null);

    const handleView = (promo: PromotionListDTO) => {
        setDetailPromoId(promo.promotionId);
    };

    // Mở Dialog Create
    const handleCreate = () => setIsCreateOpen(true);
    
    // Mở Dialog Edit với ID tương ứng
    const handleEdit = (promo: PromotionListDTO) => setEditPromoId(promo.promotionId);

    // Xử lý sau khi lưu thành công từ Dialog
    const handleDialogSuccess = () => {
        setIsCreateOpen(false);
        setEditPromoId(null);
        refresh();
    };

    const handleStatusToggle = async (promo: PromotionListDTO, checked: boolean) => {
        setTogglingId(promo.promotionId);
        try {
            const newStatus = checked ? "ACTIVE" : "DISABLED";
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
        if (item.promotionStatus === "DISABLED") return "DISABLED";

        const now = new Date();
        const start = new Date(item.startTime.endsWith('Z') ? item.startTime : `${item.startTime}Z`);
        const end = new Date(item.endTime.endsWith('Z') ? item.endTime : `${item.endTime}Z`);

        if (now < start) return "SCHEDULED";
        if (now > end) return "EXPIRED";
        return "ACTIVE";
    }, []);

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
                    {dateUtils.formatLocal(item.startTime, "dd/MM/yyyy HH:mm")}
                </span>
            ),
        },
        {
            field: "endTime",
            header: t("table.endTime"),
            width: "160px",
            cellRender: ({ item }: { item: PromotionListDTO }) => (
                <span className="text-sm text-gray-600">
                    {dateUtils.formatLocal(item.endTime, "dd/MM/yyyy HH:mm")}
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
                { label: "Active", value: "ACTIVE" },
                { label: "Scheduled", value: "SCHEDULED" },
                { label: "Disabled", value: "DISABLED" },
                { label: "Expired", value: "EXPIRED" },
            ],
            cellRender: ({ item }: { item: PromotionListDTO }) => {
                const computedStatus = getComputedStatus(item);
                // Only turn on the switch if it is currently active or scheduled.
                const isChecked = computedStatus === "ACTIVE" || computedStatus === "SCHEDULED";
                const isDisabledStatus = computedStatus === "EXPIRED";
                
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
                    <div className="flex justify-between items-center w-full">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                                {t("title")}
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">{t("description")}</p>
                        </div>
                        <PermissionGuard permission={Permissions.CreatePromotion}>
                            <Button onClick={handleCreate} variant="outline" className="shadow-md">
                                <Plus className="mr-2 h-4 w-4" />
                                {t("addNew")}
                            </Button>
                        </PermissionGuard>
                    </div>
                )}
                renderCell={handleGlobalRenderCell}
                renderActionColumn={(item) => (
                    <PromotionActions promotion={item} onView={handleView} onEdit={handleEdit} />
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