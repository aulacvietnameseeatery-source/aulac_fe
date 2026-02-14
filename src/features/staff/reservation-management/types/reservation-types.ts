// features/staff/reservation/types/reservation-types.ts

export interface ReservationDto {
    reservationId: number;
    reservedTime: string; // ISO Date string
    customerName: string;
    phone: string;
    email?: string;
    pax: number;
    statusId: number;
    statusName: string;
    preOrderSummary?: string; // Có thể null
    createdAt?: string;
}

export interface ReservationStatusDto {
    statusId: number;
    statusName: string;
    statusCode: string;
}

export interface GetReservationsParams {
    pageIndex: number;
    pageSize: number;
    search?: string;
    date?: string; // YYYY-MM-DD
    statusId?: number;
}