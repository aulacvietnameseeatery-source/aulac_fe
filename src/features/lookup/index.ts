/**
 * Lookup Feature — public API
 *
 * Provides generic CRUD infrastructure for any BE LookupValue entity
 * (table zones, table types, dish categories, etc.).
 *
 * Usage:
 *   import { useLookupCrud, createLookupService, LookupValueDto } from "@/features/lookup";
 */

// Types
export * from "./types/lookup.types";

// Service factory
export { createLookupService } from "./services/lookup.service";

// Hook
export { useLookupCrud } from "./hooks/use-lookup-crud";
export type { LookupCrudConfig, LookupCrudReturn } from "./hooks/use-lookup-crud";

// UI Components
export { LookupManagerModal, LookupCombobox } from "./components";
export type { LookupManagerModalProps, LookupComboboxProps } from "./components";
