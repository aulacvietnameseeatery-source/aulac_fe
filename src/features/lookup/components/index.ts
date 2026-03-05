/**
 * Lookup feature — UI components
 *
 * LookupManagerModal  — full CRUD modal for any BE LookupValue entity (split-panel layout)
 * LookupCombobox      — ALCombobox wrapper that bundles useLookupCrud + LookupManagerModal
 */

export { default as LookupManagerModal } from "./lookup-manager-modal";
export type { LookupManagerModalProps } from "./lookup-manager-modal";

export { default as LookupCombobox } from "./lookup-combobox";
export type { LookupComboboxProps } from "./lookup-combobox";
