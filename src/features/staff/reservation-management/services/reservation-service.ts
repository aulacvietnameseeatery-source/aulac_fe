// features/staff/reservation/services/reservation-service.ts

import { ApiResponse, PagedResult } from "@/types/api-response.types";
import { ReservationDto, ReservationStatusDto, GetReservationsParams } from "../types/reservation-types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7083/api";

export const reservationService = {
    // 1. Get List Reservations
    getReservations: async (params: GetReservationsParams): Promise<PagedResult<ReservationDto>> => {
        const query = new URLSearchParams();
        query.append("pageIndex", params.pageIndex.toString());
        query.append("pageSize", params.pageSize.toString());

        if (params.search) query.append("search", params.search);
        if (params.date) query.append("date", params.date);
        if (params.statusId) query.append("statusId", params.statusId.toString());

        const res = await fetch(`${API_BASE_URL}/reservations?${query.toString()}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to fetch reservations");
        const response: ApiResponse<PagedResult<ReservationDto>> = await res.json();
        return response.data;
    },

    // 2. Get Statuses for Tabs
    getReservationStatuses: async (): Promise<ReservationStatusDto[]> => {
        const res = await fetch(`${API_BASE_URL}/reservations/statuses`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to fetch statuses");
        const response: ApiResponse<ReservationStatusDto[]> = await res.json();
        return response.data;
    }
};