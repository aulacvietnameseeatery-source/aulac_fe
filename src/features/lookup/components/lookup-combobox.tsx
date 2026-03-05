"use client";

/**
 * LookupCombobox — drop-in combobox for any BE LookupValue entity.
 *
 * Combines ALCombobox + LookupManagerModal into one self-contained component.
 * Pass the result of `useLookupCrud()` via the `lookup` prop — no extra wiring needed.
 *
 * Usage:
 *   const zoneLookup = useLookupCrud({ baseUrl: "/api/tables/zones", queryKey: ["tables","zones"], entityLabel: "Zone" });
 *
 *   <LookupCombobox
 *     lookup={zoneLookup}
 *     title="Zone"
 *     required
 *     placeholder="Select zone"
 *     value={formData.zoneLvId}
 *     onChange={(val) => setFormData(f => ({ ...f, zoneLvId: val }))}
 *     onCreated={(item) => setFormData(f => ({ ...f, zoneLvId: item.valueId }))}
 *   />
 */

import React, { useState, useMemo } from "react";
import { Settings2 } from "lucide-react";
import { ALCombobox } from "@/components/ui/al-combobox";
import LookupManagerModal from "./lookup-manager-modal";
import type { LookupCrudReturn } from "../hooks/use-lookup-crud";
import type { LookupValueDto } from "../types/lookup.types";

// ─── Props ────────────────────────────────────────────────────

export interface LookupComboboxProps {
  /** Full result from useLookupCrud() — provides items, loading state, and CRUD callbacks */
  lookup: LookupCrudReturn;
  /** Label shown above the combobox */
  title: string;
  required?: boolean;
  placeholder?: string;
  /** Currently selected valueId. Pass `""` or `undefined` for no selection. */
  value: number | string | undefined;
  /**
   * Called with the selected `valueId` as a number, or `""` when cleared.
   * Cast to the FK field directly: `onChange={(val) => setFormData(f => ({ ...f, zoneLvId: val }))}`
   */
  onChange: (val: number | "") => void;
  /**
   * Optional: called after a new item is successfully created via the manager modal.
   * Use this to auto-select the newly created item in the parent form.
   */
  onCreated?: (item: LookupValueDto) => void;
  /** Whether the combobox is disabled */
  disabled?: boolean;
}

// ─── Component ────────────────────────────────────────────────

const LookupCombobox: React.FC<LookupComboboxProps> = ({
  lookup,
  title,
  required,
  placeholder,
  value,
  onChange,
  onCreated,
  disabled,
}) => {
  const [isManagerOpen, setIsManagerOpen] = useState(false);

  // Convert lookup items → ALCombobox options (value = string representation of valueId)
  const options = useMemo(
    () => lookup.items.map((item) => ({ label: item.valueName, value: String(item.valueId) })),
    [lookup.items]
  );

  const handleChange = (val: string | number | (string | number)[] | undefined) => {
    if (Array.isArray(val)) return; // LookupCombobox is single-select only
    onChange(val ? Number(val) : "");
  };

  const handleCreateOption = (name: string) => {
    lookup.onSave({ valueName: name }).then((item) => {
      onChange(item.valueId);
      onCreated?.(item);
    });
  };

  const handleCreatedFromManager = (item: LookupValueDto) => {
    onCreated?.(item);
    onChange(item.valueId);
    setIsManagerOpen(false);
  };

  return (
    <>
      <ALCombobox
        title={title}
        required={required}
        placeholder={placeholder}
        options={options}
        value={value ? String(value) : undefined}
        onChange={handleChange}
        searchable
        isLoading={lookup.isLoading}
        disabled={disabled}
        allowCreate
        onCreateOption={handleCreateOption}
        titleAction={
          <button
            type="button"
            title={`Manage ${lookup.entityLabel.toLowerCase()}s`}
            onClick={() => setIsManagerOpen(true)}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <Settings2 size={11} />
            Manage
          </button>
        }
      />

      <LookupManagerModal
        {...lookup}
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
        onCreated={handleCreatedFromManager}
      />
    </>
  );
};

export default LookupCombobox;
