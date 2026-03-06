// features/staff/reservation/services/reservation-service.ts

import { ApiResponse, PagedResult } from "@/types/api-response.types";
import { ReservationDto, ReservationStatusDto, GetReservationsParams } from "../types/reservation-types";
import {api} from "@/lib/http";

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
    // 3. API Check-in (Gán bàn & Đổi trạng thái sang CHECKED_IN)
    // Cần tạo endpoint PATCH /api/reservations/{id}/check-in
    // Endpoint này BE cần làm 3 việc:
    // - Đổi statusId của Reservation thành 23 (CHECKED_IN)
    // - Lưu tableId vào Reservation
    // - Đổi statusLvId của Table thành 15 (OCCUPIED)
    checkInReservation: async (reservationId: number, tableId: number): Promise<void> => {
        await api.patch(`/api/reservations/${reservationId}/check-in`, {
            tableId: tableId
        });
    }
};