import type { RestaurantTable, TableStatus, TableType, TableZone } from "./types";

export const mockTables: RestaurantTable[] = [
  // Indoor tables
  { tableId: 1,  tableCode: "T-01", capacity: 4,  status: "AVAILABLE",      type: "REGULAR",  zone: "INDOOR",   isOnline: true,  image: "/images/table-selection/ground-floor/t-01.png", activeOrders: 0, hasErrors: false },
  { tableId: 2,  tableCode: "T-02", capacity: 2,  status: "OCCUPIED",       type: "REGULAR",  zone: "INDOOR",   isOnline: true,  image: "/images/table-selection/ground-floor/t-02.png", activeOrders: 1, hasErrors: false },
  { tableId: 3,  tableCode: "T-03", capacity: 4,  status: "RESERVED",       type: "REGULAR",  zone: "INDOOR",   isOnline: true,  image: "/images/table-selection/ground-floor/t-03.png", activeOrders: 0, hasErrors: false },
  { tableId: 4,  tableCode: "T-04", capacity: 6,  status: "AVAILABLE",      type: "BOOTH",    zone: "INDOOR",   isOnline: true,  image: "/images/table-selection/ground-floor/t-04.png", activeOrders: 0, hasErrors: false },
  { tableId: 5,  tableCode: "T-05", capacity: 4,  status: "CLEANING",       type: "REGULAR",  zone: "INDOOR",   isOnline: true,  image: "/images/table-selection/ground-floor/t-05.png", activeOrders: 0, hasErrors: false },
  { tableId: 6,  tableCode: "T-06", capacity: 2,  status: "OCCUPIED",       type: "HIGH_TOP", zone: "INDOOR",   isOnline: true,  image: "/images/table-selection/ground-floor/t-06.png", activeOrders: 2, hasErrors: true },
  { tableId: 7,  tableCode: "T-07", capacity: 4,  status: "AVAILABLE",      type: "REGULAR",  zone: "INDOOR",   isOnline: true,  image: "/images/table-selection/ground-floor/t-07.png", activeOrders: 0, hasErrors: false },
  { tableId: 8,  tableCode: "T-08", capacity: 6,  status: "OUT_OF_SERVICE", type: "BOOTH",    zone: "INDOOR",   isOnline: false, image: "/images/table-selection/ground-floor/t-08.png", activeOrders: 0, hasErrors: true },

  // Outdoor tables
  { tableId: 9,  tableCode: "T-09", capacity: 2,  status: "AVAILABLE",      type: "REGULAR",  zone: "OUTDOOR",  isOnline: true,  image: "/images/table-selection/ground-floor/t-01.png", activeOrders: 0, hasErrors: false },
  { tableId: 10, tableCode: "T-10", capacity: 4,  status: "OCCUPIED",       type: "REGULAR",  zone: "OUTDOOR",  isOnline: true,  image: "/images/table-selection/ground-floor/t-02.png", activeOrders: 1, hasErrors: false },
  { tableId: 11, tableCode: "T-11", capacity: 4,  status: "AVAILABLE",      type: "REGULAR",  zone: "OUTDOOR",  isOnline: true,  image: "/images/table-selection/ground-floor/t-03.png", activeOrders: 0, hasErrors: false },
  { tableId: 12, tableCode: "T-12", capacity: 6,  status: "RESERVED",       type: "REGULAR",  zone: "OUTDOOR",  isOnline: true,  image: "/images/table-selection/ground-floor/t-04.png", activeOrders: 0, hasErrors: false },

  // Rooftop tables
  { tableId: 13, tableCode: "R-01", capacity: 4,  status: "AVAILABLE",      type: "REGULAR",  zone: "ROOFTOP",  isOnline: true,  image: "/images/table-selection/level1/l1-01.png",      activeOrders: 0, hasErrors: false },
  { tableId: 14, tableCode: "R-02", capacity: 2,  status: "OCCUPIED",       type: "HIGH_TOP", zone: "ROOFTOP",  isOnline: true,  image: "/images/table-selection/level1/l1-02.png",      activeOrders: 1, hasErrors: false },
  { tableId: 15, tableCode: "R-03", capacity: 4,  status: "CLEANING",       type: "REGULAR",  zone: "ROOFTOP",  isOnline: true,  image: "/images/table-selection/level1/l1-03.png",      activeOrders: 0, hasErrors: false },

  // Patio tables
  { tableId: 16, tableCode: "P-01", capacity: 4,  status: "AVAILABLE",      type: "REGULAR",  zone: "PATIO",    isOnline: true,  image: "/images/table-selection/ground-floor/t-05.png", activeOrders: 0, hasErrors: false },
  { tableId: 17, tableCode: "P-02", capacity: 6,  status: "OCCUPIED",       type: "REGULAR",  zone: "PATIO",    isOnline: true,  image: "/images/table-selection/ground-floor/t-06.png", activeOrders: 1, hasErrors: false },
  { tableId: 18, tableCode: "P-03", capacity: 2,  status: "AVAILABLE",      type: "BAR",      zone: "PATIO",    isOnline: false, image: "/images/table-selection/ground-floor/t-07.png", activeOrders: 0, hasErrors: false },

  // VIP Room tables
  { tableId: 19, tableCode: "V-01", capacity: 8,  status: "RESERVED",       type: "VIP",      zone: "VIP_ROOM", isOnline: true,  image: "/images/table-selection/vip-garden/v-01.png",   activeOrders: 0, hasErrors: false },
  { tableId: 20, tableCode: "V-02", capacity: 10, status: "AVAILABLE",      type: "VIP",      zone: "VIP_ROOM", isOnline: true,  image: "/images/table-selection/vip-garden/v-02.png",   activeOrders: 0, hasErrors: false },
  { tableId: 21, tableCode: "V-03", capacity: 6,  status: "OCCUPIED",       type: "VIP",      zone: "VIP_ROOM", isOnline: true,  image: "/images/table-selection/vip-garden/v-01.png",   activeOrders: 2, hasErrors: false },
  { tableId: 22, tableCode: "V-04", capacity: 12, status: "AVAILABLE",      type: "VIP",      zone: "VIP_ROOM", isOnline: true,  image: "/images/table-selection/vip-garden/v-02.png",   activeOrders: 0, hasErrors: false },
];

export const ALL_STATUSES: TableStatus[] = [
  "AVAILABLE", "OCCUPIED", "RESERVED", "CLEANING", "OUT_OF_SERVICE",
];

export const ALL_TYPES: TableType[] = [
  "REGULAR", "VIP", "BOOTH", "BAR", "HIGH_TOP",
];

export const ALL_ZONES: TableZone[] = [
  "INDOOR", "OUTDOOR", "ROOFTOP", "PATIO", "VIP_ROOM",
];

