import { api } from "@/lib/http";
import { ApiResponse } from "@/types/api-response.types";
import {
    CreateReservationRequest,
    PublicCustomerDto,
    ReservationFitCheckRequest,
    ReservationFitCheckResponse,
    ReservationResponseDto,
} from "../types/reservation.types";

export const reservationApi = {
    getCustomerByPhone: (phone: string) =>
        api.get<ApiResponse<PublicCustomerDto>>(`/api/public/customers/phone/${encodeURIComponent(phone)}`),

    fitCheck: (body: ReservationFitCheckRequest) =>
        api.post<ApiResponse<ReservationFitCheckResponse>>("/api/public/reservations/fit", body),


    createReservation: (body: CreateReservationRequest) =>
        api.post<ApiResponse<ReservationResponseDto>>(
            "/api/public/reservations",
            body
        ),
};
