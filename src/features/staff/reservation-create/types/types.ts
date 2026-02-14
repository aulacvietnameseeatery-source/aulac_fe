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

// Map from public class ManualTableAvailabilityDto
export interface TableAvailabilityDto {
  tableId: number;
  tableCode: string;
  capacity: number;
  tableType: string;
  zone: string;
}

// Map from public class CreateManualReservationRequest
export interface CreateReservationRequest {
  lockToken?: string | null;
  tableId: number;
  customerName: string;
  phone: string;
  email?: string | null;
  partySize: number;
  reservedTime: string; // DateTime ISO string (kết hợp Date + Time)
  status: string;
  source: string;
}

export interface CreateReservationResponse {
  lockToken?: string | null;
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