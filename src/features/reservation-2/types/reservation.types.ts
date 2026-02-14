export interface TableAvailabilityDto {
    tableId: number;
    tableCode: string;
    capacity: number;
    tableType: string;
    zone: string;
    isAvailable: boolean;
    lockedUntil?: string; // ISO string
    imageUrl?: string;
}

export interface CreateReservationLockRequest {
    tableId: number;
    customerName: string;
    phone: string;
    tableIds?: number[];
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
    lockToken?: string;
    tableId: number;
    customerName: string;
    phone: string;
    email?: string;
    tableIds?: number[];
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
    zone: string;
    status: string;
    createdAt: string; // ISO string
}
