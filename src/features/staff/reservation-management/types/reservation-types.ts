// features/staff/reservation/types/reservation-types.ts

export interface ReservationDto {
    notes: string;
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
    tableId?: number | null;
    tableName?: string | null;
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

// --- Reservation Detail ---
export interface ReservationDetailDto {
    reservationId: number;
    customerName: string;
    phone: string;
    email?: string;
    partySize: number;
    reservedTime: string;
    createdAt?: string;
    statusId: number;
    statusName: string;
    statusCode: string;
    sourceId: number;
    sourceName: string;
    sourceCode: string;
    notes?: string;
    tables: ReservationTableDto[];
}

export interface ReservationTableDto {
    tableId: number;
    tableCode: string;
    capacity: number;
    tableType: string;
    zone: string;
}

export interface ReservationTableOptionDto {
    optionId: string;
    tableIds: number[];
    tableCodes: string;
    zone: string;
    totalCapacity: number;
    excessCapacity: number;
    tableCount: number;
    isBestFit: boolean;
}

export interface ReservationCustomerLookupDto {
    customerId: number;
    fullName: string | null;
    phone: string;
    email: string | null;
    isMember: boolean | null;
    loyaltyPoints: number | null;
    createdAt: string | null;
}

export interface UpdateReservationRequest {
    customerName: string;
    phone: string;
    email?: string;
    partySize: number;
    reservedTime: string;
    notes?: string;
    statusId?: number;
    tableIds?: number[];
}
