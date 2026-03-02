// ──────────────────────────────────────────────────────────
// Status codes — mirrors BE LookupValue TABLE_STATUS
// ──────────────────────────────────────────────────────────
export type TableStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED" | "LOCKED";

// Type codes — mirrors BE LookupValue TABLE_TYPE
export type TableType = "REGULAR" | "VIP" | "BOOTH" | "BAR" | "HIGH_TOP" | "NORMAL" | "OUTDOOR";

// Zone codes — mirrors BE LookupValue TABLE_ZONE
export type TableZone = "INDOOR" | "OUTDOOR" | "ROOFTOP";

// ──────────────────────────────────────────────────────────
// API DTO types — match BE response exactly
// ──────────────────────────────────────────────────────────

/** Returned from GET /api/tables (list) */
export interface TableManagementDto {
  tableId: number;
  tableCode: string;
  capacity: number;
  isOnline: boolean;
  statusId: number;
  statusCode: string;
  statusName: string;
  typeId: number;
  typeName: string;
  zoneId: number;
  zoneName: string;
}

/** Returned from GET /api/tables/{id} (detail) */
export interface TableDetailDto extends TableManagementDto {
  qrCodeUrl: string | null;
  qrCodeImageUrl: string | null;
  images: TableMediaDto[];
  activeOrdersCount: number;
  hasErrors: boolean;
  upcomingReservations: UpcomingReservationDto[];
}

export interface TableMediaDto {
  mediaId: number;
  url: string;
  isPrimary: boolean;
}

export interface UpcomingReservationDto {
  reservationId: number;
  guestName: string;
  pax: number;
  reservedTime: string; // ISO 8601
  statusCode: string;   // "PENDING" | "CONFIRMED"
}

// ──────────────────────────────────────────────────────────
// Request types
// ──────────────────────────────────────────────────────────

export interface CreateTableRequest {
  tableCode: string;
  capacity: number;
  isOnline?: boolean;
  statusLvId: number;  // FK → lookup_value (TABLE_STATUS)
  typeLvId: number;
  zoneLvId: number;
}

export interface UpdateTableRequest {
  tableCode?: string;
  capacity?: number;
  isOnline?: boolean;
  statusLvId?: number;  // FK → lookup_value (TABLE_STATUS)
  typeLvId?: number;
  zoneLvId?: number;
}

export interface UpdateTableStatusRequest {
  statusLvId: number;  // FK → lookup_value (TABLE_STATUS)
}

// ──────────────────────────────────────────────────────────
// Lookup value types — re-exported from shared location
// Import from "@/types/lookup.types" if needed outside this feature
// ──────────────────────────────────────────────────────────

export type {
  I18nMap,
  LookupValueI18nDto,
  LookupValueDto,
  CreateLookupValueRequest,
  UpdateLookupValueRequest,
} from "@/features/lookup/types/lookup.types";

export { mapLookupI18n } from "@/features/lookup/types/lookup.types";

/** Returned by POST /api/tables/{id}/qr-code */
export interface QrCodeDto {
  qrCodeUrl: string | null;
  qrCodeImageUrl: string | null;
}

/** Body for PATCH /api/tables/bulk-online */
export interface BulkOnlineRequest {
  zoneId: number;
  isOnline: boolean;
}

// ──────────────────────────────────────────────────────────
// Query params for GET /api/tables
// ──────────────────────────────────────────────────────────

export interface TableQueryParams {
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  zoneId?: number;
  typeId?: number;
  statusId?: number;  // lookup_value FK for TABLE_STATUS
  isOnline?: boolean;
}

// ──────────────────────────────────────────────────────────
// Internal FE model — mapped from DTO for UI components
// ──────────────────────────────────────────────────────────

export interface RestaurantTable {
  tableId: number;
  tableCode: string;
  capacity: number;
  status: TableStatus;
  type: string;        // typeName from API (display string)
  zone: string;        // zoneName from API (display string)
  isOnline: boolean;
  statusId: number;
  typeId: number;
  zoneId: number;
  statusName: string;
  typeName: string;
  zoneName: string;
  qrCodeUrl?: string;
  qrCodeImageUrl?: string;
  images?: TableMediaDto[];
  activeOrders: number;
  hasErrors: boolean;
  upcomingReservations?: UpcomingReservationDto[];
}

// ──────────────────────────────────────────────────────────
// Form data for create/edit modal
// ──────────────────────────────────────────────────────────

export interface TableFormData {
  tableCode: string;
  capacity: number;
  statusLvId: number | "";  // FK → lookup_value (TABLE_STATUS)
  typeLvId: number | "";
  zoneLvId: number | "";
  isOnline: boolean;
  // QR fields — read from BE response; regenerate via POST /api/tables/{id}/qr-code
  qrCodeUrl?: string;
  qrCodeImageUrl?: string;
  qrCodeGenerated?: boolean;
  // Image fields (P2 — no upload endpoint yet)
  images?: string[];
}

// ──────────────────────────────────────────────────────────
// Filters (UI state)
// ──────────────────────────────────────────────────────────

export interface TableFilters {
  zone: string;           // "ALL" | zoneName string
  zoneId: number | null;  // lookup_value FK for API filter
  type: string;           // "ALL" | typeName string
  typeId: number | null;  // lookup_value FK for API filter
  status: string;         // "ALL" | statusCode string for display (e.g. "AVAILABLE")
  statusId: number | null; // lookup_value FK for API filter
  isOnline: "ALL" | "ONLINE" | "OFFLINE";
  search: string;
}

// Dashboard summary counts
export interface DashboardSummary {
  available: number;
  occupied: number;
  reserved: number;
  locked: number;
  withErrors: number;
}

// ──────────────────────────────────────────────────────────
// Status display config
// ──────────────────────────────────────────────────────────

export interface StatusConfig {
  label: string;
  dotColor: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

/**
 * Static lookup_value IDs for the TABLE_STATUS group.
 * These are the FK values (`statusLvId`) used in create/update/patch endpoints.
 *
 * ⚠️  Update these IDs to match the seeded lookup_value rows in your database.
 *    You can verify them by checking any GET /api/tables response (statusId field)
 *    or querying the lookup_value table directly.
 */
export const TABLE_STATUS_LV_IDS: Record<TableStatus, number> = {
  AVAILABLE: 1,  // TODO: replace with actual seeded lookup_value ID
  OCCUPIED: 2,   // TODO: replace with actual seeded lookup_value ID
  RESERVED: 3,   // TODO: replace with actual seeded lookup_value ID
  LOCKED: 4,     // TODO: replace with actual seeded lookup_value ID
};

export const TABLE_STATUS_CONFIG: Record<TableStatus, StatusConfig> = {
  AVAILABLE: {
    label: "Available",
    dotColor: "bg-emerald-500",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-300",
    textColor: "text-emerald-700",
  },
  OCCUPIED: {
    label: "Occupied",
    dotColor: "bg-red-500",
    bgColor: "bg-red-50",
    borderColor: "border-red-300",
    textColor: "text-red-700",
  },
  RESERVED: {
    label: "Reserved",
    dotColor: "bg-amber-500",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-300",
    textColor: "text-amber-700",
  },
  LOCKED: {
    label: "Locked",
    dotColor: "bg-gray-400",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-300",
    textColor: "text-gray-500",
  },
};

// ──────────────────────────────────────────────────────────
// Status transition rules (mirrors BE enforcement)
// ──────────────────────────────────────────────────────────

export const ALLOWED_TRANSITIONS: Record<TableStatus, TableStatus[]> = {
  AVAILABLE: ["OCCUPIED", "RESERVED", "LOCKED"],
  OCCUPIED: ["LOCKED"],
  RESERVED: ["OCCUPIED", "AVAILABLE"],
  LOCKED: ["AVAILABLE"],
};

export function canTransitionTo(current: string, next: string): boolean {
  return (
    ALLOWED_TRANSITIONS[current as TableStatus]?.includes(next as TableStatus) ?? false
  );
}

// ──────────────────────────────────────────────────────────
// Type & zone labels (display helpers)
// ──────────────────────────────────────────────────────────

export const TABLE_TYPE_LABELS: Record<string, string> = {
  REGULAR: "Regular",
  NORMAL: "Normal",
  VIP: "VIP",
  BOOTH: "Booth",
  BAR: "Bar",
  HIGH_TOP: "High-Top",
  OUTDOOR: "Outdoor",
};

export const TABLE_ZONE_LABELS: Record<string, string> = {
  INDOOR: "Indoor",
  OUTDOOR: "Outdoor",
  ROOFTOP: "Rooftop",
};

export const TABLE_ZONE_ICONS: Record<string, string> = {
  INDOOR: "🏠",
  OUTDOOR: "🌿",
  ROOFTOP: "🌤️",
};

// ──────────────────────────────────────────────────────────
// DTO → FE model mapper
// ──────────────────────────────────────────────────────────

export function mapDtoToTable(dto: TableManagementDto): RestaurantTable {
  return {
    tableId: dto.tableId,
    tableCode: dto.tableCode,
    capacity: dto.capacity,
    status: (dto.statusCode as TableStatus) || "AVAILABLE",
    type: dto.typeName,
    zone: dto.zoneName,
    isOnline: dto.isOnline,
    statusId: dto.statusId,
    typeId: dto.typeId,
    zoneId: dto.zoneId,
    statusName: dto.statusName,
    typeName: dto.typeName,
    zoneName: dto.zoneName,
    activeOrders: 0,
    hasErrors: false,
  };
}

export function mapDetailDtoToTable(dto: TableDetailDto): RestaurantTable {
  return {
    tableId: dto.tableId,
    tableCode: dto.tableCode,
    capacity: dto.capacity,
    status: (dto.statusCode as TableStatus) || "AVAILABLE",
    type: dto.typeName,
    zone: dto.zoneName,
    isOnline: dto.isOnline,
    statusId: dto.statusId,
    typeId: dto.typeId,
    zoneId: dto.zoneId,
    statusName: dto.statusName,
    typeName: dto.typeName,
    zoneName: dto.zoneName,
    qrCodeUrl: dto.qrCodeUrl ?? undefined,
    qrCodeImageUrl: dto.qrCodeImageUrl ?? undefined,
    images: dto.images,
    activeOrders: dto.activeOrdersCount,
    hasErrors: dto.hasErrors,
    upcomingReservations: dto.upcomingReservations,
  };
}
