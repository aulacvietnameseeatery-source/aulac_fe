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
    customerName: string;
    phone: string;
    email?: string;
    partySize: number;
    reservedTime: string; // ISO string
    notes?: string;
}

export interface ReservationFitCheckRequest {
    partySize: number;
    reservedTime: string;
}

export interface ReservationFitCheckResponse {
    canBookOnline: boolean;
    message?: string;
}

export interface PublicCustomerDto {
    customerId: number;
    fullName?: string | null;
    phone: string;
    email?: string | null;
    isMember?: boolean | null;
    loyaltyPoints?: number | null;
    createdAt?: string | null;
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
