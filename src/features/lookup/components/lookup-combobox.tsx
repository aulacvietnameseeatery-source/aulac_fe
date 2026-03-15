"use client";

/**
 * LookupCombobox — drop-in combobox for any BE LookupValue entity.
 *
 * Combines ALCombobox + LookupManagerModal into one self-contained component.
 * Pass the result of `useLookupCrud()` via the `lookup` prop — no extra wiring needed.
 *
 * Usage:
 *   const zoneLookup = useLookupCrud({ typeId: LOOKUP_TYPE.TableZone, queryKey: ["lookups","table-zone"], entityLabel: "Zone", typeLabel: "Zone" });
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
  /** Currently selected valueId(s). Pass `""` / `undefined` / `[]` for no selection. */
  value: number | string | Array<number | string> | undefined;
  /** Enable multi-select mode. @default false */
  multiple?: boolean;
  /**
   * Called with selected `valueId`.
   * - single mode: `number | ""`
   * - multiple mode: `number[]`
   */
  onChange: (val: number | "" | number[]) => void;
  /**
   * Optional: called after a new item is successfully created via the manager modal.
   * Use this to auto-select the newly created item in the parent form.
   */
  onCreated?: (item: LookupValueDto) => void;
  /** Whether the combobox is disabled */
  disabled?: boolean;
  /** Optional validation message */
  error?: string;
  /** Locale for displaying translated names */
  locale?: "en" | "vi" | "fr";
}

// ─── Component ────────────────────────────────────────────────

const LookupCombobox: React.FC<LookupComboboxProps> = ({
  lookup,
  title,
  required,
  placeholder,
  value,
  multiple = false,
  onChange,
  onCreated,
  disabled,
  error,
  locale,
}) => {
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const isConfigurable = lookup.isConfigurable ?? true;

  // Convert lookup items → ALCombobox options (value = string representation of valueId)
  const options = useMemo(
    () =>
      lookup.items.map((item) => ({
        label: locale ? item.i18n?.[locale] ?? item.i18n?.en ?? item.valueName : item.valueName,
        value: String(item.valueId),
      })),
    [lookup.items, locale]
  );

  const handleChange = (val: string | number | (string | number)[] | undefined) => {
    if (multiple) {
      if (!Array.isArray(val)) {
        onChange([]);
        return;
      }
      onChange(
        val
          .map((item) => Number(item))
          .filter((item) => !Number.isNaN(item))
      );
      return;
    }

    if (Array.isArray(val)) {
      onChange("");
      return;
    }

    onChange(val ? Number(val) : "");
  };

  const selectedValues = useMemo(
    () =>
      Array.isArray(value)
        ? value
            .map((item) => Number(item))
            .filter((item) => !Number.isNaN(item))
        : [],
    [value]
  );

  const handleCreateOption = (name: string) => {
    if (!isConfigurable) return;
    lookup.onSave({ valueName: name }).then((item) => {
      if (multiple) {
        const next = selectedValues.includes(item.valueId)
          ? selectedValues
          : [...selectedValues, item.valueId];
        onChange(next);
      } else {
        onChange(item.valueId);
      }
      onCreated?.(item);
    });
  };

  const handleCreatedFromManager = (item: LookupValueDto) => {
    onCreated?.(item);
    if (multiple) {
      const next = selectedValues.includes(item.valueId)
        ? selectedValues
        : [...selectedValues, item.valueId];
      onChange(next);
    } else {
      onChange(item.valueId);
    }
    setIsManagerOpen(false);
  };

  return (
    <>
      <ALCombobox
        title={title}
        required={required}
        placeholder={placeholder}
        options={options}
        value={
          multiple
            ? selectedValues.map((item) => String(item))
            : value
              ? String(value)
              : undefined
        }
        onChange={handleChange}
        multiple={multiple}
        searchable
        error={error}
        isLoading={lookup.isLoading}
        disabled={disabled}
        allowCreate={isConfigurable}
        onCreateOption={isConfigurable ? handleCreateOption : undefined}
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
