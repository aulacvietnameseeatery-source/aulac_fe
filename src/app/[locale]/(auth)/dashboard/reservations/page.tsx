"use client";

import React, { Suspense, useState } from "react";
import { Loader2, RefreshCcw, Search, Armchair, Calendar as CalendarIcon, CirclePlus } from "lucide-react";
import { format } from "date-fns";
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

const ReservationListContent = () => {
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

    const handleCreate = () => {
        router.push(`/dashboard/reservations/create`);
    };

    const [assignTableReservation, setAssignTableReservation] = useState<ReservationDto | null>(null);

    const handleStatusUpdate = async (reservationId: number, statusCode: string) => {
        try {
            await reservationService.updateReservationStatus(reservationId, statusCode);
            toast.success("Trạng thái đã được cập nhật thành công!");
            actions.refresh();
        } catch (error: any) {
            toast.error(error.message || "Lỗi khi cập nhật trạng thái");
        }
    };

    return (
        <div className="w-full min-h-screen bg-[#f8f9fa] p-4 md:p-6 font-sans">

            {/* --- PAGE HEADER --- */}
            <div className="flex flex-col gap-4 md:gap-6 mb-6">

                {/* Hàng 1: Tiêu đề */}
                <div className="flex items-center justify-between sm:justify-start gap-3">
                    <h3 className="text-2xl font-bold text-gray-800 m-0">Reservations</h3>
                    <button
                        onClick={actions.refresh}
                        className="p-2 bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
                        title="Refresh"
                    >
                        <RefreshCcw className="w-4 h-4" />
                    </button>
                </div>

                {/* Hàng 2: Toolbar Trái - Phải */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 w-full">

                    {/* TRÁI: Date Picker & Tabs */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full xl:w-auto">

                        {/* Date Picker (Full width on Mobile) */}
                        <div className="relative flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm h-[40px] px-3 hover:border-blue-400 transition-colors w-full sm:w-auto shrink-0">
                            <CalendarIcon className="w-4 h-4 text-gray-500 mr-2" />
                            <input
                                type="date"
                                value={filters.date ? format(filters.date, "yyyy-MM-dd") : ""}
                                onChange={(e) => actions.onDateChange(e.target.value ? new Date(e.target.value) : null)}
                                className="w-full outline-none text-sm text-gray-700 bg-transparent cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                            />
                        </div>

                        {/* Tabs Filter (Scrollable ngang trên Mobile) */}
                        <div className="flex bg-gray-100/80 p-1 rounded-lg border border-gray-200/60 overflow-x-auto hide-scrollbar w-full sm:w-auto max-w-full">
                            <button
                                onClick={() => actions.onStatusChange(null)}
                                className={`shrink-0 px-4 py-1.5 text-[13px] font-medium rounded-md transition-all whitespace-nowrap ${
                                    filters.statusId === null
                                        ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                }`}
                            >
                                All
                            </button>
                            {statuses.map(status => (
                                <button
                                    key={status.statusId}
                                    onClick={() => actions.onStatusChange(status.statusId)}
                                    className={`shrink-0 px-4 py-1.5 text-[13px] font-medium rounded-md transition-all whitespace-nowrap ${
                                        filters.statusId === status.statusId
                                            ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
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
                        <div className="relative flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm h-[40px] w-full sm:w-auto">
                            <div className="px-3 bg-gray-50 border-r border-gray-200 h-full flex items-center justify-center shrink-0">
                                <Search className="w-4 h-4 text-gray-500" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search customer, phone..."
                                value={filters.search || ""}
                                onChange={(e) => actions.onSearchChange(e.target.value)}
                                className="px-3 py-2 w-full sm:w-[220px] md:w-[260px] outline-none text-sm text-gray-700 placeholder:text-gray-400"
                            />
                        </div>

                        {/* Nút Add New */}
                        <Button
                            onClick={handleCreate}
                            variant="outline"
                            className="h-[40px] w-full sm:w-auto shrink-0"
                        >
                            <CirclePlus size={16} className="mr-2" />
                            Add Reservation
                        </Button>
                    </div>
                </div>
            </div>

            {/* --- GRID AREA --- */}
            <div className="flex-1">
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : (
                    <>
                        {/* Lưới hiển thị Card (Responsive Grid) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {reservations.map((item) => (
                                <ReservationCard
                                    key={item.reservationId}
                                    reservation={item}
                                    statuses={statuses}
                                    onAssignTable={() => setAssignTableReservation(item)}
                                    onCardClick={(id) => router.push(`/dashboard/reservations/${id}`)}
                                    onStatusUpdate={handleStatusUpdate}
                                />
                            ))}
                        </div>

                        {reservations.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200 border-dashed mt-4">
                                <Armchair className="w-12 h-12 text-gray-300 mb-3" />
                                <p className="text-gray-500 text-lg">No reservations found</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* --- NEW PAGINATION --- */}
            {reservations.length > 0 && !isLoading && (
                <div className="mt-6 shadow-sm border border-gray-200 rounded-b-xl overflow-hidden bg-white overflow-x-auto">
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