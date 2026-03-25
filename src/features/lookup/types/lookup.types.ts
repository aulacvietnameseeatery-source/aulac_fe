// ──────────────────────────────────────────────────────────
// Lookup value types
// Used by any feature that manages BE LookupValue entities
// (zones, table types, dish statuses, tags, etc.)
// ──────────────────────────────────────────────────────────

/** Reusable per-locale translation map */
export interface I18nMap {
  vi?: string;
  en?: string;
  fr?: string;
}

/**
 * Lookup type IDs from backend `Core.Enum.LookupType`.
 * Use these IDs with `/api/lookups/{typeId}` endpoints.
 */
export const LOOKUP_TYPE = {
  AccountStatus: 1,
  InventoryTxType: 2,
  InventoryTxStatus: 3,
  MediaType: 4,
  TableStatus: 5,
  TableType: 6,
  ReservationSource: 7,
  ReservationStatus: 8,
  OrderSource: 9,
  OrderStatus: 10,
  PaymentMethod: 11,
  DishStatus: 12,
  OrderItemStatus: 13,
  Severity: 14,
  PromotionType: 15,
  PromotionStatus: 16,
  IngredientType: 17,
  Tag: 18,
  TableZone: 19,
  DishDiet: 20,
  ShiftType: 21,
  ShiftStatus: 22,
  ShiftAssignmentStatus: 23,
  AttendanceStatus: 24,
  CouponType: 25,
  CouponStatus: 26,
  IngredientUnit: 27,
  InventoryCategory: 28,
  ExportReason: 29,
  VarianceReason: 30,
  KitchenToolType: 31,
  ConsumableType: 32,
  EquipmentType: 33,
} as const;

export type LookupTypeId = (typeof LOOKUP_TYPE)[keyof typeof LOOKUP_TYPE];

/**
 * Lookup types that are NOT configurable (cannot add/delete values).
 * They can still be updated (name, description, sortOrder).
 */
export const NON_CONFIGURABLE_LOOKUP_TYPES = new Set<LookupTypeId>([
  LOOKUP_TYPE.AccountStatus,
  LOOKUP_TYPE.InventoryTxType,
  LOOKUP_TYPE.InventoryTxStatus,
  LOOKUP_TYPE.TableStatus,
  LOOKUP_TYPE.ReservationStatus,
  LOOKUP_TYPE.OrderStatus,
  LOOKUP_TYPE.OrderItemStatus,
  LOOKUP_TYPE.DishStatus,
  LOOKUP_TYPE.PromotionStatus,
  LOOKUP_TYPE.TableZone,
  LOOKUP_TYPE.ShiftStatus,
  LOOKUP_TYPE.ShiftAssignmentStatus,
  LOOKUP_TYPE.AttendanceStatus,
]);

export function isLookupTypeConfigurable(typeId: LookupTypeId): boolean {
  return !NON_CONFIGURABLE_LOOKUP_TYPES.has(typeId);
}

/**
 * Raw shape returned by any BE lookup GET/POST/PUT endpoint.
 * The BE does NOT include `valueName` — display names come from the `i18n` map.
 */
export interface LookupValueI18nDto {
  valueId: number;
  valueCode: string;
  sortOrder: number;
  /** Name translations */
  i18n?: I18nMap;
  /** Description translations */
  descriptionI18n?: I18nMap;
}

/** FE-enriched shape — `valueName` and `description` derived from i18n by the service layer. */
export interface LookupValueDto extends LookupValueI18nDto {
  /** Derived: i18n.en ?? i18n.vi ?? i18n.fr ?? valueCode */
  valueName: string;
  /** Derived: descriptionI18n.en ?? descriptionI18n.vi ?? descriptionI18n.fr ?? "" */
  description: string;
}

/**
 * Maps a raw BE lookup response to the FE-enriched DTO.
 * Call this in every service method that returns a lookup value.
 */
export function mapLookupI18n(dto: LookupValueI18nDto): LookupValueDto {
  return {
    ...dto,
    valueName: dto.i18n?.en ?? dto.i18n?.vi ?? dto.i18n?.fr ?? dto.valueCode,
    description:
      dto.descriptionI18n?.en ??
      dto.descriptionI18n?.vi ??
      dto.descriptionI18n?.fr ??
      "",
  };
}

export interface CreateLookupValueRequest {
  /** Primary fallback name — used when i18n is not provided */
  valueName: string;
  /** Auto-generated (SCREAMING_SNAKE_CASE) if omitted */
  valueCode?: string;
  sortOrder?: number;
  /** Per-locale display names */
  i18n?: I18nMap;
  /** Per-locale descriptions */
  descriptionI18n?: I18nMap;
}

export interface UpdateLookupValueRequest {
  valueName?: string;
  sortOrder?: number;
  /** Per-locale display names to update */
  i18n?: I18nMap;
  /** Per-locale descriptions to update */
  descriptionI18n?: I18nMap;
}

export interface ReorderLookupItem {
  valueId: number;
  sortOrder: number;
}

export interface BatchReorderLookupRequest {
  items: ReorderLookupItem[];
}

export interface BatchReorderLookupResponse {
  typeId: number;
  updatedCount: number;
  version?: string;
}
