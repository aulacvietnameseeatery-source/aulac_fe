import type React from "react";

/**
 * A single option in the combobox dropdown.
 */
export interface ALComboboxOption {
  /** Display text for the option. */
  label: string;
  /** Unique value identifying this option. */
  value: string | number;
  /** Optional icon rendered before the label. */
  icon?: React.ReactNode;
  /** Optional secondary description text. */
  description?: string;
  /** Group key — used when `grouped` is true. */
  group?: string;
  /** Whether this individual option is disabled. */
  disabled?: boolean;
}

/**
 * Size variants for the combobox trigger.
 */
export type ALComboboxSize = "sm" | "default" | "lg";

/**
 * Visual state variants.
 */
export type ALComboboxState = "default" | "error" | "success";

/**
 * Props for the ALCombobox component.
 */
export interface ALComboboxProps {
  // ── Options & Value ─────────────────────────────────────
  /** List of selectable options. */
  options: ALComboboxOption[];
  /** Current selected value(s). Pass array for multi-select. */
  value?: string | number | (string | number)[];
  /** Callback when selection changes. */
  onChange?: (value: string | number | (string | number)[]) => void;
  /** Placeholder text when nothing is selected. */
  placeholder?: string;

  // ── Mode ────────────────────────────────────────────────
  /** Allow selecting multiple options. @default false */
  multiple?: boolean;
  /** Enable search/filter in the dropdown. @default true */
  searchable?: boolean;
  /** Show a clear button to reset selection. @default false */
  clearable?: boolean;
  /** Show a select-all action row when `multiple` is true. @default false */
  showSelectAll?: boolean;
  /** Label for the select-all action. */
  selectAllLabel?: string;
  /** Label for the clear-all action. */
  clearAllLabel?: string;
  /** Allow user to create a new option from typed text. @default false */
  allowCreate?: boolean;
  /** Callback when user creates a new option. */
  onCreateOption?: (inputValue: string) => void;

  // ── Layout & Label ──────────────────────────────────────
  /** Label displayed above the trigger. */
  title?: string;
  /** Helper text displayed below the trigger. */
  description?: string;
  /** Error message displayed below the trigger (overrides description). */
  error?: string;
  /** Mark the field as required (shows * after title). */
  required?: boolean;

  // ── Size & State ────────────────────────────────────────
  /** Trigger size variant. @default "default" */
  inputSize?: ALComboboxSize;
  /** Visual state — auto-set to "error" when `error` is provided. */
  state?: ALComboboxState;

  // ── Icons ───────────────────────────────────────────────
  /** Icon rendered at the start of the trigger. */
  iconStart?: React.ReactNode;

  // ── Custom Rendering ────────────────────────────────────
  /** Custom renderer for each option row. */
  renderOption?: (option: ALComboboxOption, isSelected: boolean) => React.ReactNode;
  /** Custom renderer for the selected value in the trigger. */
  renderValue?: (option: ALComboboxOption) => React.ReactNode;  /** Extra node rendered on the right side of the title label (e.g. a manage button). */
  titleAction?: React.ReactNode;
  // ── Async / Loading ─────────────────────────────────────
  /** Show a loading spinner in the dropdown. */
  isLoading?: boolean;
  /** Message shown when no options match the search. */
  emptyMessage?: string;
  /** Placeholder text for the search input inside dropdown. */
  searchPlaceholder?: string;

  // ── Grouping ────────────────────────────────────────────
  /** Display options grouped by their `group` field. @default false */
  grouped?: boolean;

  // ── State ───────────────────────────────────────────────
  /** Disable the combobox. */
  disabled?: boolean;
  /** Make the combobox read-only (can read but not change). */
  readOnly?: boolean;

  // ── Multi-select display ─────────────────────────────────
  /**
   * How to display selected items when `multiple` is true.
   * - `"collapse"` (default): show up to `maxTags` badges, then "+N more" with tooltip.
   * - `"expand"`: expand the trigger height to show all badges.
   * @default "collapse"
   */
  tagMode?: "collapse" | "expand";
  /** Maximum visible badges before collapsing (only when tagMode="collapse"). @default 3 */
  maxTags?: number;

  // ── Styling ─────────────────────────────────────────────
  /** Additional class names for the trigger button. */
  className?: string;
  /** Additional class names for the outermost wrapper. */
  wrapperClassName?: string;
  /** Additional class names for the dropdown popover. */
  popoverClassName?: string;
  /** Max height of the options list in px. @default 240 */
  maxHeight?: number;
  /** Name attribute (for forms). */
  name?: string;
  /** Freeform text to display in the trigger when no option matches the value. Useful for AI-filled unmatched values. */
  freeformText?: string;

  // ── Controlled search (freeform input) ──────────────────
  /** Controlled search value. When provided, the combobox acts as a freeform search box: typed text persists even after closing. */
  searchValue?: string;
  /** Callback fired whenever the internal search text changes (typing, clearing). Required when `searchValue` is set. */
  onSearchChange?: (value: string) => void;
}
