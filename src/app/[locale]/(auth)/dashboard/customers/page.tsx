"use client";

import React, { Suspense, useCallback, useMemo, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { BaseTable } from "@/components/ui/table/base-table";
import { TableColumn } from "@/types/table.types";
import { useTranslations } from "next-intl";
import { ProtectedRoute } from "@/components/protected-route";
import { PermissionGuard } from "@/components/permission-guard";
import { Permissions } from "@/types/const";
import { ALTitleCard } from "@/components/ui/al-title-card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import dayjs from "dayjs";
import { useCustomerList } from "@/features/staff/customer-management/hooks/use-customer-list";
import { CustomerListDto, CustomerDetailDto } from "@/features/staff/customer-management/types/customer-types";
import { CustomerActions } from "@/features/staff/customer-management/components/customer-actions";
import { CustomerModal, CustomerFormData } from "@/features/staff/customer-management/components/customer-modal";
import { LoyaltyManagementModal } from "@/features/staff/customer-management/components/LoyaltyManagementModal";
import { staffCustomerService } from "@/features/staff/customer-management/services/customer-service";
import { ConfirmModal } from "@/components/layout/admin-sidebar/confirm-modal";
import { useRouter } from "@/routing"
import { dateUtils } from "@/lib/date-utils";

const CustomerListContent = () => {
    const t = useTranslations("Customer.List");
    const router = useRouter();
    const tAdd = useTranslations("Customer.Add");
    const tEdit = useTranslations("Customer.Edit");

    const { customers, isLoading, totalCount, paginationInfo, onDataChange, refresh } = useCustomerList();

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetailDto | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);

    // Loyalty modal state
    const [loyaltyModalOpen, setLoyaltyModalOpen] = useState(false);
    const [customerToManageLoyalty, setCustomerToManageLoyalty] = useState<CustomerListDto | null>(null);

    // Delete modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<CustomerListDto | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const getUtcDateString = (utcDateString: string) => {
        const dateStringWithZ = utcDateString.endsWith('Z') ? utcDateString : `${utcDateString}Z`;
        return dateStringWithZ;
    };

    // Handlers
    const handleView = async (customer: CustomerListDto) => {
        router.push(`/dashboard/customers/${customer.customerId}/detail`);
    };

    const handleEdit = async (customer: CustomerListDto) => {
        setIsLoadingDetail(true);
        try {
            const detail = await staffCustomerService.getById(customer.customerId);
            setSelectedCustomer(detail);
            setModalMode("edit");
            setModalOpen(true);
        } catch (error: any) {
            toast.error(error.response?.data?.userMessage || t("notifications.loadError"));
        } finally {
            setIsLoadingDetail(false);
        }
    };

    const handleManageLoyalty = (customer: CustomerListDto) => {
        setCustomerToManageLoyalty(customer);
        setLoyaltyModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedCustomer(null);
        setModalMode("add");
        setModalOpen(true);
    };

    const handleDeleteClick = (customer: CustomerListDto) => {
        setCustomerToDelete(customer);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!customerToDelete) return;
        setIsDeleting(true);
        try {
            await staffCustomerService.deleteCustomer(customerToDelete.customerId);
            toast.success(t("notifications.deleteSuccess"));
            refresh();
            setDeleteModalOpen(false);
            setCustomerToDelete(null);
        } catch (error: any) {
            const status = error.response?.status || error.status;
            const errorMessage = status === 400
                ? t("notifications.deleteHasDependencies")
                : t("notifications.deleteError");
            toast.error(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedCustomer(null);
    };

    const handleSubmit = async (formData: CustomerFormData) => {
        setIsSubmitting(true);
        try {
            if (modalMode === "add") {
                await staffCustomerService.createCustomer({
                    phone: formData.phone.trim(),
                    fullName: formData.fullName.trim() || undefined,
                    email: formData.email.trim() || undefined,
                    isMember: formData.isMember,
                });
                toast.success(tAdd("notifications.createSuccess"));
            } else if (modalMode === "edit" && selectedCustomer) {
                await staffCustomerService.updateCustomer(selectedCustomer.customerId, {
                    phone: formData.phone.trim(),
                    fullName: formData.fullName.trim() || undefined,
                    email: formData.email.trim() || undefined,
                    isMember: formData.isMember,
                });
                toast.success(tEdit("notifications.updateSuccess"));
            }
            refresh();
            handleCloseModal();
        } catch (error: any) {
            const status = error.response?.status || error.status;
            let errorMessage: string;
            if (status === 400) {
                errorMessage = modalMode === "add"
                    ? tAdd("notifications.phoneAlreadyExists")
                    : tEdit("notifications.phoneAlreadyExists");
            } else {
                errorMessage = modalMode === "add"
                    ? tAdd("notifications.createError")
                    : tEdit("notifications.updateError");
            }
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter Options
    const memberFilterOptions = useMemo(() => [
        { label: t("filters.member"), value: "true" },
        { label: t("filters.guest"), value: "false" }
    ], [t]);

    // Table Columns
    const columns: TableColumn[] = useMemo(() => [
        {
            field: "no",
            header: t("table.no"),
            width: "60px",
            align: "center" as const,
            sortable: false,
            cellRender: ({ rowIndex }: { rowIndex: number }) =>
                (paginationInfo.page - 1) * paginationInfo.pageSize + rowIndex + 1,
        },
        {
            field: "fullName",
            header: t("table.customerName"),
            width: "150px",
            filterType: "text" as const,
            cellRender: ({ item }: { item: CustomerListDto }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{item.fullName || "Guest"}</span>
                    <span className="text-xs text-gray-500">{item.phone}</span>
                </div>
            ),
        },
        {
            field: "email",
            header: t("table.email"),
            width: "180px",
            cellRender: ({ value }: { value: string | null }) => (
                <span className="text-gray-600">{value || "-"}</span>
            ),
        },
        {
            field: "isMember",
            header: t("table.type"),
            width: "110px",
            align: "center" as const,
            filterType: "select" as const,
            filterOptions: memberFilterOptions,
            cellRender: ({ value }: { value: boolean }) => (
                value ?
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">{t("labels.member")}</span> :
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">{t("labels.guest")}</span>
            ),
        },
        {
            field: "orderCount",
            header: t("table.orders"),
            width: "90px",
            align: "center" as const,
            cellRender: ({ value }: { value: number }) => (
                <span className="font-semibold text-gray-700">{value}</span>
            ),
        },
        {
            field: "loyaltyPoints",
            header: t("table.points"),
            width: "80px",
            align: "center" as const,
            cellRender: ({ value }: { value: number | null }) => (
                <span className="text-orange-600 font-medium">{value || 0}</span>
            ),
        },
        {
            field: "lastOrderTime",
            header: t("table.lastOrder"),
            width: "150px",
            cellRender: ({ value }: { value: string | null }) => (
                <span className="text-gray-600 text-sm">
                    {value ? dateUtils.formatLocal(getUtcDateString(value), "dd/MM/yyyy HH:mm") : "-"}
                </span>
            ),
        },
    ], [paginationInfo.page, paginationInfo.pageSize, t, memberFilterOptions]);

    const handleGlobalRenderCell = useCallback(
        (value: any, item: CustomerListDto, column: TableColumn, rowIndex: number) => {
            const content = column.cellRender
                ? column.cellRender({ value, item, column, rowIndex })
                : value;
            return column.align ? <div style={{ textAlign: column.align }}>{content}</div> : content;
        },
        []
    );

    return (
        <>
            <div className="w-full h-full flex flex-col overflow-hidden">
                <BaseTable<CustomerListDto>
                    data={customers}
                    loading={isLoading || isLoadingDetail}
                    columns={columns}
                    rowKey="customerId"
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
                                <PermissionGuard permission={Permissions.CreateAccount}>
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
                        <CustomerActions
                            customer={item}
                            onView={handleView}
                            onLoyalty={handleManageLoyalty}
                            onEdit={handleEdit}
                            onDelete={handleDeleteClick}
                        />
                    )}
                />
            </div>

            {/* Add / Edit / View Modal */}
            <CustomerModal
                isOpen={modalOpen}
                mode={modalMode}
                customer={selectedCustomer}
                onClose={handleCloseModal}
                onSubmit={handleSubmit}
                onEdit={() => setModalMode("edit")}
                isSubmitting={isSubmitting}
            />

            <LoyaltyManagementModal
                isOpen={loyaltyModalOpen}
                customer={customerToManageLoyalty}
                onClose={() => {
                    setLoyaltyModalOpen(false);
                    setCustomerToManageLoyalty(null);
                }}
                onSuccess={refresh}
            />

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => { setDeleteModalOpen(false); setCustomerToDelete(null); }}
                onConfirm={handleConfirmDelete}
                title={t("deleteModal.title")}
                message={t("deleteModal.message", { name: customerToDelete?.fullName || customerToDelete?.phone || "" })}
                confirmText={t("deleteModal.confirm")}
                cancelText={t("deleteModal.cancel")}
                isLoading={isDeleting}
                variant="danger"
            />
        </>
    );
};

export default function CustomerListPage() {
    return (
        <ProtectedRoute permission={Permissions.ViewCustomer}>
            <Suspense fallback={
                <div className="flex h-screen items-center justify-center">
                    <Loader2 className="animate-spin text-gray-400" />
                </div>
            }>
                <CustomerListContent />
            </Suspense>
        </ProtectedRoute>
    );
}
