import { api } from "@/lib/http";
import { ApiResponse } from "@/types/api-response.types";
import {
    CreateReservationRequest,
    PublicCustomerDto,
    ReservationFitCheckRequest,
    ReservationFitCheckResponse,
    ReservationResponseDto,
    TableAvailabilityDto,
} from "../types/reservation.types";

export const reservationApi = {
    getCustomerByPhone: (phone: string) =>
        api.get<ApiResponse<PublicCustomerDto>>(`/api/public/customers/phone/${encodeURIComponent(phone)}`),

    fitCheck: (body: ReservationFitCheckRequest) =>
        api.post<ApiResponse<ReservationFitCheckResponse>>("/api/public/reservations/fit", body),

    getAvailability: (params: { reservedTime?: string; partySize?: number, zone?: string }) => {
        const query = new URLSearchParams();
        if (params.reservedTime) query.append("reservedTime", params.reservedTime);
        if (params.partySize) query.append("partySize", params.partySize.toString());
        if (params.zone && params.zone !== "All") query.append("zone", params.zone);

        return api.get<ApiResponse<TableAvailabilityDto[]>>(`/api/public/availability?${query.toString()}`);
    },

    createReservation: (body: CreateReservationRequest) =>
        api.post<ApiResponse<ReservationResponseDto>>(
            "/api/public/reservations",
            body
        ),
};
