// app/admin/reservations/page.tsx

"use client";

import React, { Suspense, useMemo } from "react";
import { Loader2, Clock, Phone, User, Utensils } from "lucide-react";
import { format } from "date-fns";

// Components
import { BaseTable } from "@/components/ui/table/base-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableColumn } from "@/types/table.types";
import { Pagination } from "@/components/ui/pagination";
import {useReservationList} from "@/features/staff/reservation-management/hooks/use-reservation-list";
import {ReservationHeader} from "@/features/staff/reservation-management/components/reservation-header";
import {ReservationDto} from "@/features/staff/reservation-management/types/reservation-types"; // Giữ lại pagination footer

// Features

const ReservationListContent = () => {
    const {
        reservations,
        statuses,
        isLoading,
        pagination,
        filters,
        actions
    } = useReservationList();

    // --- Render Helpers ---

    // Map Status ID sang Badge Color (Sử dụng đúng ID từ DB: 21, 22, 23...)
    const renderStatusBadge = (statusId: number, statusName: string) => {
        let variant: any = "outline";
        switch (statusId) {
            case 21: variant = "secondary"; break;    // PENDING (Xám)
            case 22: variant = "info"; break;         // CONFIRMED (Xanh dương)
            case 23: variant = "success"; break;      // CHECKED_IN/ARRIVED (Xanh lá)
            case 24: variant = "ghost"; break;        // CANCELLED (Nhạt)
            case 25: variant = "destructive"; break;  // NO_SHOW (Đỏ)
            default: variant = "outline";
        }
        return <Badge variant={variant} className="font-semibold">{statusName}</Badge>;
    };

    // --- Table Columns ---
    const columns: TableColumn[] = useMemo(() => [
        {
            field: 'no',
            header: 'No',
            width: '60px',
            align: 'center',
            cellRender: ({ rowIndex }) => (pagination.pageIndex - 1) * pagination.pageSize + rowIndex + 1,
        },
        {
            field: 'reservedTime',
            header: 'Time',
            width: '100px',
            cellRender: ({ value }) => (
                <div className="flex items-center gap-1 font-bold text-gray-700">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {format(new Date(value), "HH:mm")}
                </div>
            )
        },
        {
            field: 'customerName',
            header: 'Customer',
            width: '250px',
            cellRender: ({ value, item }) => (
                <div className="flex flex-col">
                    <div className="font-semibold text-gray-900">{value}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" /> {item.phone}
                    </div>
                </div>
            )
        },
        {
            field: 'pax',
            header: 'Pax',
            width: '80px',
            align: 'center',
            cellRender: ({ value }) => (
                <div className="flex items-center justify-center gap-1 bg-gray-100 px-2 py-1 rounded-md w-fit mx-auto">
                    <User className="w-3 h-3 text-gray-500" />
                    <span className="font-medium text-gray-700">{value}</span>
                </div>
            )
        },
        {
            field: 'preOrderSummary',
            header: 'Pre-order',
            width: '150px',
            align: 'center',
            cellRender: ({ value }) => value ? (
                <div className="flex items-center justify-center gap-1 text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                    <Utensils className="w-3 h-3" />
                    <span className="text-sm">{value}</span>
                </div>
            ) : (
                <span className="text-gray-300 text-xl font-light">–</span>
            )
        },
        {
            field: 'status',
            header: 'Status',
            width: '130px',
            align: 'center',
            cellRender: ({ item }) => renderStatusBadge(item.statusId, item.statusName)
        },
        {
            field: 'action',
            header: 'Action',
            width: '100px',
            align: 'right',
            cellRender: () => (
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                    Detail
                </Button>
            )
        }
    ], [pagination.pageIndex, pagination.pageSize]);

    return (
        <div className="w-full h-full flex flex-col overflow-hidden bg-gray-50/50">
            {/* Header with Search & Tabs */}
            <div className="shrink-0 px-6 pt-6">
                <ReservationHeader
                    searchTerm={filters.search}
                    onSearchChange={actions.onSearchChange}
                    currentDate={filters.date}
                    onDateChange={actions.onDateChange}
                    currentStatusId={filters.statusId}
                    onStatusChange={actions.onStatusChange}
                    statuses={statuses}
                />
            </div>

            {/* Table Area */}
            <div className="flex-1 px-6 pb-4 overflow-hidden">
                <div className="h-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-auto">
                        <BaseTable<ReservationDto>
                            data={reservations}
                            loading={isLoading}
                            columns={columns}
                            rowKey="reservationId"
                            onRefresh={actions.refresh}
                            // Tích hợp pagination vào BaseTable nếu muốn (như bài Dish)
                            // total={pagination.totalCount}
                            // pageIndex={pagination.pageIndex}
                            // pageSize={pagination.pageSize}
                            // onPageChange={actions.onPageChange}
                            // onPageSizeChange={actions.onPageSizeChange}
                        />
                    </div>

                    {/* Footer Pagination (Nếu BaseTable chưa tích hợp) */}
                    <div className="border-t bg-white px-4 py-3">
                        <Pagination
                            current={pagination.pageIndex}
                            pageSize={pagination.pageSize}
                            total={pagination.totalCount}
                            onChange={(page, size) => {
                                if (page !== pagination.pageIndex) actions.onPageChange(page);
                                if (size !== pagination.pageSize) actions.onPageSizeChange(size);
                            }}
                            pageSizeOptions={[10, 20, 50]}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function ReservationPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-gray-400" /></div>}>
            <ReservationListContent />
        </Suspense>
    );
}