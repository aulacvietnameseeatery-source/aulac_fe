import type { ALInputSize, ALInputState } from "@/components/ui/al-input";

/**
 * Props for ALDatePicker — calendar-based date picker
 * that matches ALInput styling.
 */
export interface ALDatePickerProps {
  // ── Layout & Label ──────────────────────────────────────────
  /** Label displayed above the picker. */
  title?: string;
  /** Helper text displayed below the picker. */
  description?: string;
  /** Error message displayed below the picker (overrides description). */
  error?: string;
  /** Shows * after title. */
  required?: boolean;

  // ── Size & State ───────────────────────────────────────────
  /** Size variant. @default "default" */
  inputSize?: ALInputSize;
  /** Visual state variant — auto-set to "error" when `error` is provided. */
  state?: ALInputState;

  // ── Value ──────────────────────────────────────────────────
  /** Selected date as "YYYY-MM-DD" string. */
  value?: string;
  /** Called with "YYYY-MM-DD" string or "" when cleared. */
  onChange?: (value: string) => void;
  /** Placeholder when no date is selected. @default "Pick a date" */
  placeholder?: string;
  /** date-fns format string for displaying the selected date. @default "dd/MM/yyyy" */
  displayFormat?: string;

  // ── Calendar constraints ───────────────────────────────────
  /** Minimum selectable date as "YYYY-MM-DD". */
  minDate?: string;
  /** Maximum selectable date as "YYYY-MM-DD". */
  maxDate?: string;
  /** Array of "YYYY-MM-DD" strings that should be disabled. */
  disabledDates?: string[];

  // ── Behavior ───────────────────────────────────────────────
  /** Show a clear button when a date is selected. @default false */
  clearable?: boolean;

  // ── Styling ────────────────────────────────────────────────
  /** Additional class names for the outermost wrapper. */
  wrapperClassName?: string;
  /** Additional class names for the trigger button group. */
  groupClassName?: string;
  /** Additional class names for the displayed value text. */
  className?: string;

  // ── Native ─────────────────────────────────────────────────
  disabled?: boolean;
  readOnly?: boolean;
  /** Name for the hidden input (form compatibility). */
  name?: string;
}
