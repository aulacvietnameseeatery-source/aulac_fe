// Map from public class CustomerDto
export interface CustomerDto {
  customerId: number;
  fullName: string | null;
  phone: string;
  email: string | null;
  isMember: boolean | null;
  loyaltyPoints: number | null;
  createdAt: string | null; // DateTime string
}

// Map from public class ManualTableOptionDto
export interface TableOptionDto {
  optionId: string;
  tableIds: number[];
  tableCodes: string;
  zone: string;
  totalCapacity: number;
  excessCapacity: number;
  tableCount: number;
  isBestFit: boolean;
}

// Map from public class CreateManualReservationRequest
export interface CreateReservationRequest {
  customerId?: number;
  tableId?: number;
  tableIds?: number[];
  customerName: string;
  phone: string;
  email?: string | null;
  partySize: number;
  reservedTime: string; // DateTime ISO string (kết hợp Date + Time)
  status: string;
  source: string;
}

export interface CreateReservationResponse {
  reservationId: number;
  customerName: string;
  phone: string;
  email?: string | null;
  partySize: number;
  reservedTime: string; // DateTime ISO string (kết hợp Date + Time)
  tableCode: string;
  zone: string;
  status: string;
  createdAt: string;
}

export type BookingSource = 'phone' | 'walk_in';
export type BookingStatus = 'confirmed' | 'checked_in';
export type CustomerType = 'new' | 'member';