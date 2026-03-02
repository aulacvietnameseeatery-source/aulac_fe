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
