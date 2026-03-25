import type React from "react";
import type { NumericFormatProps } from "react-number-format";

/**
 * Option type for dropdown addons.
 */
export interface ALInputOption {
  label: string;
  value: string | number;
}

/**
 * Configuration for a dropdown addon (start or end).
 */
export interface ALInputDropdownConfig {
  options: ALInputOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Configuration for a button addon (start or end).
 */
export interface ALInputButtonConfig {
  label?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  variant?: "default" | "primary" | "outline" | "ghost" | "gold";
  isLoading?: boolean;
  className?: string;
}

/**
 * Size variants for the ALInput component.
 */
export type ALInputSize = "sm" | "default" | "lg";

/**
 * Visual state variants for the ALInput component.
 */
export type ALInputState = "default" | "error" | "success";

/** Field renderer variants for ALInput. */
export type ALInputFieldVariant = "input" | "textarea";

/**
 * Visual style variants for the ALInput chrome.
 * - `"outline"` — bordered (default, current behaviour)
 * - `"filled"` — light background fill, border appears on focus
 * - `"ghost"` — transparent until hover/focus
 * - `"underline"` — bottom border only (Material-style)
 */
export type ALInputVariant = "outline" | "filled" | "ghost" | "underline";

/**
 * Props for the ALInput component.
 *
 * Supports icons, text labels, dropdowns, and buttons as addons
 * on either side of the input field, plus title/description/error.
 */
export interface ALInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  // ── Layout & Label ──────────────────────────────────────────
  /** Label displayed above the input. */
  title?: string;
  /** Helper text displayed below the input. */
  description?: string;
  /** Error message displayed below the input (overrides description). */
  error?: string;
  /** Whether the field is required (shows * after title). */
  required?: boolean;

  // ── Size & State (CVA) ─────────────────────────────────────
  /** Input size variant. @default "default" */
  inputSize?: ALInputSize;
  /** Visual state variant — auto-set to "error" when `error` is provided. */
  state?: ALInputState;
  /** Field rendering mode. @default "input" */
  fieldVariant?: ALInputFieldVariant;
  /** Visual style variant. @default "outline" */
  variant?: ALInputVariant;

  // ── Icon addons ────────────────────────────────────────────
  /** ReactNode rendered at the inline-start of the input. */
  iconStart?: React.ReactNode;
  /** ReactNode rendered at the inline-end of the input. */
  iconEnd?: React.ReactNode;
  /** Callback when the start icon is clicked. */
  onIconStartClick?: () => void;
  /** Callback when the end icon is clicked. */
  onIconEndClick?: () => void;

  // ── Text addons ────────────────────────────────────────────
  /** Static text rendered at the inline-start (e.g. "$", "https://"). */
  textStart?: string;
  /** Static text rendered at the inline-end (e.g. "USD", ".com"). */
  textEnd?: string;

  // ── Dropdown addons ────────────────────────────────────────
  /** Dropdown selector at the inline-start. */
  dropdownStart?: ALInputDropdownConfig;
  /** Dropdown selector at the inline-end. */
  dropdownEnd?: ALInputDropdownConfig;

  // ── Button addons ──────────────────────────────────────────
  /** Action button at the inline-start. */
  buttonStart?: ALInputButtonConfig;
  /** Action button at the inline-end. */
  buttonEnd?: ALInputButtonConfig;

  // ── Styling ────────────────────────────────────────────────
  /** Additional class names for the outermost wrapper. */
  wrapperClassName?: string;
  /** Additional class names for the input-group row. */
  groupClassName?: string;
  /** Additional class names for textarea element when `fieldVariant="textarea"`. */
  textareaClassName?: string;

  // ── Textarea behavior ─────────────────────────────────────
  /** Number of visible lines when `fieldVariant="textarea"`. */
  textareaRows?: number;
  /** Native textarea props, merged with shared ALInput props. */
  textareaProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;

  // ── Time input behavior ────────────────────────────────────
  /**
   * When `type="time"`, controls whether the UI renders as 12-hour (AM/PM) columns.
   * @default true
   */
  timeUse12Hour?: boolean;
  /**
   * Minute increment for `type="time"` custom UI.
   * Falls back to native `step` (seconds) when possible.
   * @default 1
   */
  timeMinuteStep?: number;

  // ── Number input behavior ──────────────────────────────────
  /** Step used by number steppers when `type="number"`. Falls back to native `step` if provided. */
  numberStepper?: number;
  /** Thousand separator passed to NumberInput (`","`, ".", or `true`). */
  numberThousandSeparator?: NumericFormatProps["thousandSeparator"];
  /** Optional prefix (for example `$`) when `type="number"`. */
  numberPrefix?: string;
  /** Optional suffix (for example `%`) when `type="number"`. */
  numberSuffix?: string;
  /** Keep fixed decimal digits when `type="number"`. */
  numberFixedDecimalScale?: boolean;
  /** Decimal precision for formatted number input. */
  numberDecimalScale?: number;
}
