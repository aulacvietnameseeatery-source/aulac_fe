/**
 * Legacy mock data — kept for reference / local testing only.
 * The orchestrator now fetches from the API via useTablesQuery().
 *
 * NOTE: Types updated to match BE schema. Old statuses (CLEANING, OUT_OF_SERVICE)
 * and zones (PATIO, VIP_ROOM) have been replaced.
 */
import type { RestaurantTable, TableStatus, TableType, TableZone } from "./types";

export const mockTables: RestaurantTable[] = [
  // Indoor
  { tableId: 1,  tableCode: "T-01", capacity: 4,  status: "AVAILABLE", statusId: 14, statusName: "Available", type: "REGULAR", typeId: 18, typeName: "Regular", zone: "INDOOR", zoneId: 55, zoneName: "Indoor", isOnline: true,  activeOrders: 0, hasErrors: false },
  { tableId: 2,  tableCode: "T-02", capacity: 2,  status: "OCCUPIED",  statusId: 15, statusName: "Occupied",  type: "REGULAR", typeId: 18, typeName: "Regular", zone: "INDOOR", zoneId: 55, zoneName: "Indoor", isOnline: true,  activeOrders: 1, hasErrors: false },
  { tableId: 3,  tableCode: "T-03", capacity: 4,  status: "RESERVED",  statusId: 16, statusName: "Reserved",  type: "REGULAR", typeId: 18, typeName: "Regular", zone: "INDOOR", zoneId: 55, zoneName: "Indoor", isOnline: true,  activeOrders: 0, hasErrors: false },
  { tableId: 4,  tableCode: "T-04", capacity: 6,  status: "AVAILABLE", statusId: 14, statusName: "Available", type: "BOOTH",   typeId: 19, typeName: "Booth",   zone: "INDOOR", zoneId: 55, zoneName: "Indoor", isOnline: true,  activeOrders: 0, hasErrors: false },
  { tableId: 5,  tableCode: "T-05", capacity: 4,  status: "LOCKED",    statusId: 17, statusName: "Locked",    type: "REGULAR", typeId: 18, typeName: "Regular", zone: "INDOOR", zoneId: 55, zoneName: "Indoor", isOnline: true,  activeOrders: 0, hasErrors: false },
  { tableId: 6,  tableCode: "T-06", capacity: 2,  status: "OCCUPIED",  statusId: 15, statusName: "Occupied",  type: "HIGH_TOP",typeId: 20, typeName: "High Top",zone: "INDOOR", zoneId: 55, zoneName: "Indoor", isOnline: true,  activeOrders: 2, hasErrors: true },
  // Outdoor
  { tableId: 9,  tableCode: "T-09", capacity: 2,  status: "AVAILABLE", statusId: 14, statusName: "Available", type: "REGULAR", typeId: 18, typeName: "Regular", zone: "OUTDOOR", zoneId: 56, zoneName: "Outdoor", isOnline: true,  activeOrders: 0, hasErrors: false },
  { tableId: 10, tableCode: "T-10", capacity: 4,  status: "OCCUPIED",  statusId: 15, statusName: "Occupied",  type: "REGULAR", typeId: 18, typeName: "Regular", zone: "OUTDOOR", zoneId: 56, zoneName: "Outdoor", isOnline: true,  activeOrders: 1, hasErrors: false },
  // Rooftop
  { tableId: 13, tableCode: "R-01", capacity: 4,  status: "AVAILABLE", statusId: 14, statusName: "Available", type: "REGULAR", typeId: 18, typeName: "Regular", zone: "ROOFTOP", zoneId: 57, zoneName: "Rooftop", isOnline: true,  activeOrders: 0, hasErrors: false },
  { tableId: 14, tableCode: "R-02", capacity: 2,  status: "LOCKED",    statusId: 17, statusName: "Locked",    type: "HIGH_TOP",typeId: 20, typeName: "High Top",zone: "ROOFTOP", zoneId: 57, zoneName: "Rooftop", isOnline: true,  activeOrders: 0, hasErrors: false },
];

export const ALL_STATUSES: TableStatus[] = [
  "AVAILABLE", "OCCUPIED", "RESERVED", "LOCKED",
];

export const ALL_TYPES: TableType[] = [
  "REGULAR", "VIP", "BOOTH", "BAR", "HIGH_TOP",
];

export const ALL_ZONES: TableZone[] = [
  "INDOOR", "OUTDOOR", "ROOFTOP",
];
