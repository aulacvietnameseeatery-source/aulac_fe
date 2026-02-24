// Status for the restaurant table
export type TableStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED" | "CLEANING" | "OUT_OF_SERVICE";

// Type of restaurant table
export type TableType = "REGULAR" | "VIP" | "BOOTH" | "BAR" | "HIGH_TOP";

// Zone / floor area
export type TableZone = "INDOOR" | "OUTDOOR" | "ROOFTOP" | "PATIO" | "VIP_ROOM";

// Main restaurant table entity
export interface RestaurantTable {
  tableId: number;
  tableCode: string;
  capacity: number;
  status: TableStatus;
  type: TableType;
  zone: TableZone;
  isOnline: boolean;
  qrCodeUrl?: string;
  qrCodeGenerated?: boolean;
  image?: string;
  images?: string[];
  activeOrders: number;
  hasErrors: boolean;
}

// Form data for creating / editing a table
export interface TableFormData {
  tableCode: string;
  capacity: number;
  status: TableStatus | "";
  type: TableType | "";
  zone: TableZone | "";
  isOnline: boolean;
  qrCodeUrl?: string;
  qrCodeGenerated?: boolean;
  images?: string[];
}

// Filters for the table management page
export interface TableFilters {
  zone: TableZone | "ALL";
  type: TableType | "ALL";
  status: TableStatus | "ALL";
  isOnline: "ALL" | "ONLINE" | "OFFLINE";
  search: string;
}

// Dashboard summary counts
export interface DashboardSummary {
  available: number;
  occupied: number;
  reserved: number;
  cleaning: number;
  outOfService: number;
  withErrors: number;
}

// Status display config
export interface StatusConfig {
  label: string;
  dotColor: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

// Lookup maps
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
  CLEANING: {
    label: "Cleaning",
    dotColor: "bg-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
    textColor: "text-blue-700",
  },
  OUT_OF_SERVICE: {
    label: "Out of Service",
    dotColor: "bg-gray-400",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-300",
    textColor: "text-gray-500",
  },
};

export const TABLE_TYPE_LABELS: Record<TableType, string> = {
  REGULAR: "Regular",
  VIP: "VIP",
  BOOTH: "Booth",
  BAR: "Bar",
  HIGH_TOP: "High-Top",
};

export const TABLE_ZONE_LABELS: Record<TableZone, string> = {
  INDOOR: "Indoor",
  OUTDOOR: "Outdoor",
  ROOFTOP: "Rooftop",
  PATIO: "Patio",
  VIP_ROOM: "VIP Room",
};

export const TABLE_ZONE_ICONS: Record<TableZone, string> = {
  INDOOR: "🏠",
  OUTDOOR: "🌿",
  ROOFTOP: "🌤️",
  PATIO: "☂️",
  VIP_ROOM: "👑",
};
