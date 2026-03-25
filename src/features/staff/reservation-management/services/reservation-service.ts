// features/staff/reservation/services/reservation-service.ts

import { ApiResponse, PagedResult } from "@/types/api-response.types";
import {
    ReservationDto,
    ReservationStatusDto,
    GetReservationsParams,
    ReservationDetailDto,
    ReservationTableOptionDto,
    ReservationCustomerLookupDto,
} from "../types/reservation-types";
import { api } from "@/lib/http";
import { dateUtils } from '@/lib/date-utils';

export const reservationService = {
    // 1. Get List Reservations
    getReservations: async (params: GetReservationsParams): Promise<PagedResult<ReservationDto>> => {
        const query = new URLSearchParams();
        query.append("pageIndex", params.pageIndex.toString());
        query.append("pageSize", params.pageSize.toString());

        if (params.search) query.append("search", params.search);
        if (params.date) query.append("date", params.date);
        if (params.statusId) query.append("statusId", params.statusId.toString());

        const response = await api.get<ApiResponse<PagedResult<ReservationDto>>>(`/api/reservations?${query.toString()}`);

        return response.data;
    },

    // 2. Get Statuses for Tabs
    getReservationStatuses: async (): Promise<ReservationStatusDto[]> => {
        const response = await api.get<ApiResponse<ReservationStatusDto[]>>(`/api/reservations/statuses`);
        return response.data;
    },


    // 3. Xếp bàn và Xác nhận đơn (CONFIRMED)
    assignTableAndConfirm: async (reservationId: number, tableIds: number[]): Promise<void> => {
        await api.patch(`/api/reservations/${reservationId}/assign-and-confirm`, {
            tableIds: tableIds
        });
    },

    // 4. Get Reservation Detail
    getReservationDetail: async (reservationId: number): Promise<ReservationDetailDto> => {
        const response = await api.get<ApiResponse<ReservationDetailDto>>(`/api/reservations/${reservationId}`);
        return response.data;
    },

    // 5. Cập nhật trạng thái đặt bàn (CHECKED_IN, CANCELLED, NO_SHOW...)
    updateReservationStatus: async (reservationId: number, statusCode: string, notes?: string): Promise<void> => {
        await api.patch(`/api/reservations/${reservationId}/status`, {
            status: statusCode,
            notes: notes
        });
    },

    // 6. Cập nhật thông tin đặt bàn
    updateReservation: async (reservationId: number, data: any): Promise<void> => {
        await api.put(`/api/reservations/${reservationId}`, data);
    },

    // 7. Xóa đặt bàn
    deleteReservation: async (reservationId: number): Promise<void> => {
        await api.delete(`/api/reservations/${reservationId}`);
    },

    // 8. Tìm khách theo số điện thoại
    searchCustomerByPhone: async (phone: string): Promise<ReservationCustomerLookupDto | null> => {
        try {
            const response = await api.get<ApiResponse<ReservationCustomerLookupDto>>(`/api/customers/phone/${phone}`);
            return response.data;
        } catch (err: any) {
            if (err.response?.status === 404) {
                return null;
            }
            throw err;
        }
    },

    // 9. Lấy table options cho manual flow theo workflow
    getManualTableOptions: async (
        date: string,
        time: string,
        partySize: number
    ): Promise<ReservationTableOptionDto[]> => {
        const reservedTime = dateUtils.toUtcIso(date, time);
        const params = new URLSearchParams({
            reservedTime,
            partySize: partySize.toString(),
        });
        const response = await api.get<ApiResponse<ReservationTableOptionDto[]>>(
            `/api/manual/table/availability?${params}`
        );
        return response.data;
    },
};