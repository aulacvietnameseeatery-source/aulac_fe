export interface TableAvailabilityDto {
    tableId: number;
    tableCode: string;
    capacity: number;
    tableType: string;
    zone: string;
    isAvailable: boolean;
    imageUrl?: string;
}

export interface CreateReservationRequest {
    customerId?: number;
    customerName?: string;
    phone: string;
    email?: string;
    partySize: number;
    reservedTime: string; // ISO string
    bookingToken?: string;
    notes?: string;
}

export interface ReservationFitCheckRequest {
    partySize: number;
    reservedTime: string;
}

export interface ReservationFitCheckResponse {
    canBookOnline: boolean;
    message?: string;
    bookingToken?: string;
}

export interface PublicCustomerLookupDto {
    customerId: number;
    phone: string;
    maskedName?: string | null;
    maskedEmail?: string | null;
}

export interface ReservationResponseDto {
    reservationId: number;
    customerName: string;
    phone: string;
    email?: string;
    partySize: number;
    reservedTime: string; // ISO string
    tableCode: string;
    zone: string;
    status: string;
    createdAt: string; // ISO string
}
