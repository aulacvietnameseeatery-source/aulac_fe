export interface TableAvailabilityDto {
    tableId: number;
    tableCode: string;
    capacity: number;
    tableType: string;
    isAvailable: boolean;
    lockedUntil?: string; // ISO string
}

export interface CreateReservationLockRequest {
    tableId: number;
    customerName: string;
    phone: string;
    partySize: number;
    reservedTime: string; // ISO string
}

export interface ReservationLockResponseDto {
    lockToken: string;
    expiresAt: string; // ISO string
    tableId: number;
    tableCode: string;
}

export interface CreateReservationRequest {
    lockToken: string;
    tableId: number;
    customerName: string;
    phone: string;
    email?: string;
    partySize: number;
    reservedTime: string; // ISO string
}

export interface ReservationResponseDto {
    reservationId: number;
    customerName: string;
    phone: string;
    email?: string;
    partySize: number;
    reservedTime: string; // ISO string
    tableCode: string;
    status: string;
    createdAt: string; // ISO string
}
