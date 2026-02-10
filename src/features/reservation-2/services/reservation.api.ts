import { api } from "@/lib/http";
import { ApiResponse } from "@/types/api-response.types";
import {
    CreateReservationLockRequest,
    CreateReservationRequest,
    ReservationLockResponseDto,
    ReservationResponseDto,
    TableAvailabilityDto,
} from "../types/reservation.types";

export const reservationApi = {
    getAvailability: (params: { reservedTime?: string; partySize?: number, zone?: string }) => {
        const query = new URLSearchParams();
        if (params.reservedTime) query.append("reservedTime", params.reservedTime);
        if (params.partySize) query.append("partySize", params.partySize.toString());
        if (params.zone && params.zone !== "All") query.append("zone", params.zone);

        return api.get<ApiResponse<TableAvailabilityDto[]>>(`/api/public/availability?${query.toString()}`);
    },

    lockTable: (body: CreateReservationLockRequest) =>
        api.post<ApiResponse<ReservationLockResponseDto>>(
            "/api/public/reservations/lock",
            body
        ),

    createReservation: (body: CreateReservationRequest) =>
        api.post<ApiResponse<ReservationResponseDto>>(
            "/api/public/reservations",
            body
        ),
};
