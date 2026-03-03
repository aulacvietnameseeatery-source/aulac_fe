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
