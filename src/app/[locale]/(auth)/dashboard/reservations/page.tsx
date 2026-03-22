"use client";

import React, { Suspense, useState } from "react";
import { Loader2, RefreshCcw, Search, Armchair, Calendar as CalendarIcon, CirclePlus } from "lucide-react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useReservationList } from "@/features/staff/reservation-management/hooks/use-reservation-list";
import { ReservationCard } from "@/features/staff/reservation-management/components/reservation-card";
import { AssignTableModal } from "@/features/staff/reservation-management/components/assign-table-modal";
import { ReservationDto } from "@/features/staff/reservation-management/types/reservation-types";
import { TablePagination } from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { Permissions } from "@/types/const";
import { reservationService } from "@/features/staff/reservation-management/services/reservation-service";
import { toast } from "sonner";
import { EditReservationModal } from "@/features/staff/reservation-management/components/edit-reservation-modal";
import { ALConfirmDialog } from "@/components/ui/al-confirm-dialog";
import { CreateReservationModal } from "@/features/staff/reservation-create";

const ReservationListContent = () => {
    const t = useTranslations("reservations.management.List");
    const tm = useTranslations("reservations.management.Messages");
    const router = useRouter();
    const {
        reservations,
        statuses,
        isLoading,
        pagination,
        filters,
        actions
    } = useReservationList();

    /// ---  TablePagination ---
    const { pageIndex, pageSize, totalCount, totalPage } = pagination;

    const startItem = totalCount === 0 ? 0 : (pageIndex - 1) * pageSize + 1;
    const endItem = Math.min(pageIndex * pageSize, totalCount);
    const pageInfo = `${startItem}-${endItem} of ${totalCount}`;

    const hasPrev = pageIndex > 1;
    const hasNext = pageIndex < totalPage;

    const handlePageChange = (action: 'first' | 'prev' | 'next' | 'last') => {
        let newPage = pageIndex;
        if (action === 'first') newPage = 1;
        if (action === 'prev') newPage = Math.max(1, pageIndex - 1);
        if (action === 'next') newPage = Math.min(totalPage, pageIndex + 1);
        if (action === 'last') newPage = totalPage;

        if (newPage !== pageIndex) {
            actions.onPageChange(newPage);
        }
    };

    const [showCreateModal, setShowCreateModal] = useState(false);

    const handleCreate = () => {
        setShowCreateModal(true);
    };

    const [assignTableReservation, setAssignTableReservation] = useState<ReservationDto | null>(null);
    const [editReservationId, setEditReservationId] = useState<number | null>(null);
    const [deleteReservationId, setDeleteReservationId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleStatusUpdate = async (reservationId: number, statusCode: string) => {
        try {
            await reservationService.updateReservationStatus(reservationId, statusCode);
            toast.success(tm("checkInSuccess"));
            actions.refresh();
        } catch (error: any) {
            toast.error(error.message || tm("checkInFail"));
        }
    };

    const handleDelete = async () => {
        if (!deleteReservationId) return;
        setIsDeleting(true);
        try {
            await reservationService.deleteReservation(deleteReservationId);
            toast.success(t("deleteSuccess") || "Xóa đơn đặt bàn thành công!");
            actions.refresh();
        } catch (error: any) {
            toast.error(error.message || t("deleteFail") || "Lỗi khi xóa đơn đặt bàn");
        } finally {
            setIsDeleting(false);
            setDeleteReservationId(null);
        }
    };

    return (
        <div className="w-full h-full min-h-0 overflow-hidden bg-[#FDFBF9] px-4 py-4 md:px-0 md:py-0 font-sans flex flex-col">

            {/* --- PAGE HEADER --- */}
            <div className="shrink-0 flex flex-col gap-4 md:gap-6 mb-4 md:mb-6 sticky top-0 z-20 bg-[#FDFBF9]/95 backdrop-blur-md border-b border-[#D5BA98]/30 pb-4 md:border-b-0 md:bg-transparent md:backdrop-blur-none md:pb-0">

                {/* Hàng 1: Tiêu đề */}
                <div className="flex items-center justify-between sm:justify-start gap-3">
                    <h3 className="text-2xl font-bold text-[#1A3A52] m-0">{t("title")}</h3>
                    <button
                        onClick={actions.refresh}
                        className="p-2 bg-[#FDFBF9] border border-[#D5BA98]/60 rounded-full text-[#1A3A52]/70 hover:bg-[#D5BA98]/10 hover:text-[#1A3A52] transition-colors shadow-none"
                        title={t("refresh") || "Refresh"}
                    >
                        <RefreshCcw className="w-4 h-4" />
                    </button>
                </div>

                {/* Hàng 2: Toolbar Trái - Phải */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 w-full">

                    {/* TRÁI: Date Picker & Tabs */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full xl:w-auto">

                        {/* Date Picker (Full width on Mobile) */}
                        <div className="relative flex items-center bg-[#FDFBF9] border border-[#D5BA98]/60 rounded-lg overflow-hidden shadow-none h-10 px-3 hover:border-[#1A3A52]/35 transition-colors w-full sm:w-auto shrink-0">
                            <CalendarIcon className="w-4 h-4 text-[#1A3A52]/55 mr-2" />
                            <input
                                type="date"
                                value={filters.date ? format(filters.date, "yyyy-MM-dd") : ""}
                                onChange={(e) => actions.onDateChange(e.target.value ? new Date(e.target.value) : null)}
                                className="w-full outline-none text-sm text-[#1A3A52] bg-transparent cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                            />
                        </div>

                        {/* Tabs Filter (Scrollable ngang trên Mobile) */}
                        <div className="flex bg-[#D5BA98]/12 p-1 rounded-lg border border-[#D5BA98]/40 overflow-x-auto hide-scrollbar w-full sm:w-auto max-w-full">
                            <button
                                onClick={() => actions.onStatusChange(null)}
                                className={`shrink-0 px-4 py-1.5 text-[13px] font-medium rounded-md transition-all whitespace-nowrap ${filters.statusId === null
                                    ? 'bg-[#1A3A52] text-white shadow-sm border border-[#1A3A52]'
                                    : 'text-[#1A3A52]/65 hover:text-[#1A3A52] hover:bg-[#D5BA98]/18'
                                    }`}
                            >
                                {t("all")}
                            </button>
                            {statuses.map(status => (
                                <button
                                    key={status.statusId}
                                    onClick={() => actions.onStatusChange(status.statusId)}
                                    className={`shrink-0 px-4 py-1.5 text-[13px] font-medium rounded-md transition-all whitespace-nowrap ${filters.statusId === status.statusId
                                        ? 'bg-[#1A3A52] text-white shadow-sm border border-[#1A3A52]'
                                        : 'text-[#1A3A52]/65 hover:text-[#1A3A52] hover:bg-[#D5BA98]/18'
                                        }`}
                                >
                                    {status.statusName}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* PHẢI: Search & Add New */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto xl:ml-auto">

                        {/* Thanh Search */}
                        <div className="relative flex items-center bg-[#FDFBF9] border border-[#D5BA98]/60 rounded-lg overflow-hidden shadow-none h-10 w-full sm:w-auto">
                            <div className="px-3 bg-[#D5BA98]/10 border-r border-[#D5BA98]/35 h-full flex items-center justify-center shrink-0">
                                <Search className="w-4 h-4 text-[#1A3A52]/55" />
                            </div>
                            <input
                                type="text"
                                placeholder={t("searchPlaceholder")}
                                value={filters.search || ""}
                                onChange={(e) => actions.onSearchChange(e.target.value)}
                                className="px-3 py-2 w-full sm:w-55 md:w-65 outline-none text-sm text-[#1A3A52] bg-transparent placeholder:text-[#1A3A52]/40"
                            />
                        </div>

                        {/* Nút Add New */}
                        <Button
                            onClick={handleCreate}
                            variant="outline"
                            className="h-10 w-full sm:w-auto shrink-0 border-[#D5BA98]/60 bg-[#FDFBF9] text-[#1A3A52] hover:bg-[#D5BA98]/10"
                        >
                            <CirclePlus size={16} className="mr-2" />
                            {t("addNew")}
                        </Button>
                    </div>
                </div>
            </div>

            {/* --- GRID AREA --- */}
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center items-center py-20 flex-1">
                        <Loader2 className="w-8 h-8 animate-spin text-[#1A3A52]" />
                    </div>
                ) : (
                    <>
                        {/* Lưới hiển thị Card (Responsive Grid) */}
                        <div className="flex-1 min-h-0 overflow-auto custom-scrollbar pr-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 pb-4">
                                {reservations.map((item) => (
                                    <ReservationCard
                                        key={item.reservationId}
                                        reservation={item}
                                        statuses={statuses}
                                        onAssignTable={() => setAssignTableReservation(item)}
                                        onEdit={(id) => setEditReservationId(id)}
                                        onDelete={(id) => setDeleteReservationId(id)}
                                        onCardClick={(id) => router.push(`/dashboard/reservations/${id}`)}
                                        onStatusUpdate={handleStatusUpdate}
                                    />
                                ))}
                            </div>

                            {reservations.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-16 bg-[#FDFBF9] rounded-xl border border-[#D5BA98]/40 border-dashed mt-4 text-[#1A3A52]/60">
                                    <Armchair className="w-12 h-12 text-[#D5BA98] mb-3" />
                                    <p className="text-[#1A3A52] text-lg">{t("empty")}</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* --- NEW PAGINATION --- */}
            {reservations.length > 0 && !isLoading && (
                <div className="mt-4 shrink-0 shadow-none border border-[#D5BA98]/50 rounded-xl overflow-hidden bg-[#FDFBF9] overflow-x-auto">
                    <TablePagination
                        totalCount={totalCount}
                        pageSize={pageSize}
                        pageSizes={[10, 20, 50, 100]}
                        pageInfo={pageInfo}
                        hasPrev={hasPrev}
                        hasNext={hasNext}
                        onPageSizeChange={actions.onPageSizeChange}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}

            {assignTableReservation && (
                <AssignTableModal
                    reservation={assignTableReservation}
                    onClose={() => setAssignTableReservation(null)}
                    onSuccess={() => {
                        setAssignTableReservation(null);
                        actions.refresh();
                    }}
                />
            )}

            {editReservationId && (
                <EditReservationModal
                    reservationId={editReservationId}
                    onClose={() => setEditReservationId(null)}
                    onSuccess={() => {
                        setEditReservationId(null);
                        actions.refresh();
                    }}
                />
            )}

            {showCreateModal && (
                <CreateReservationModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        actions.refresh();
                    }}
                />
            )}

            <ALConfirmDialog
                isOpen={!!deleteReservationId}
                onClose={() => setDeleteReservationId(null)}
                onConfirm={handleDelete}
                variant="delete"
                title={t("deleteTitle") || "Xóa đơn đặt bàn"}
                message={t("deleteMessage") || "Bạn có chắc chắn muốn xóa đơn đặt bàn này? Hành động này không thể hoàn tác và sẽ giải phóng các bàn đã gán (nếu có)."}
                isLoading={isDeleting}
                confirmText={t("confirmDelete") || "Xác nhận xóa"}
                cancelText={t("cancel") || "Hủy"}
            />
        </div>
    );
};

export default function ReservationPage() {
    return (
        <ProtectedRoute permission={Permissions.ViewReservation}>
            <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-gray-400" /></div>}>
                <ReservationListContent />
            </Suspense>
        </ProtectedRoute>
    );
}