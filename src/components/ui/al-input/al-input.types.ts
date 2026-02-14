import type React from "react";

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
}
