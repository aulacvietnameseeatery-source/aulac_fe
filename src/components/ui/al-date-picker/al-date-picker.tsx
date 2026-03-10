"use client";

import * as React from "react";
import { CalendarIcon, X } from "lucide-react";
import { format, parse, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import "@/styles/components/al-input.css";

import type { ALDatePickerProps } from "./al-date-picker.types";
import type { ALInputSize, ALInputState } from "@/components/ui/al-input";
import type { Matcher } from "react-day-picker";

// ─── Helpers ────────────────────────────────────────────────

/** Map size prop → CSS class */
const sizeClass = (size: ALInputSize = "default") =>
  ({
    sm: "al-input-group--sm",
    default: "al-input-group--default",
    lg: "al-input-group--lg",
  })[size];

/** Map size prop → font class */
const fontClass = (size: ALInputSize = "default") =>
  ({
    sm: "text-xs",
    default: "text-sm",
    lg: "text-base",
  })[size];

/** Resolve visual state, auto-detecting error from props */
const stateClass = (
  state: ALInputState | undefined,
  error: string | undefined
) => {
  const resolved: ALInputState = error ? "error" : state ?? "default";
  return {
    default: "",
    error: "al-input-group--error",
    success: "al-input-group--success",
  }[resolved];
};

/**
 * Parse a date string (YYYY-MM-DD) into a Date object.
 * Returns undefined if invalid.
 */
function parseDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const d = parse(value, "yyyy-MM-dd", new Date());
  return isValid(d) ? d : undefined;
}

// ─── Main component ─────────────────────────────────────────

const ALDatePicker = React.forwardRef<HTMLButtonElement, ALDatePickerProps>(
  (
    {
      // Layout
      title,
      description,
      error,
      required: isRequired,

      // Size & state
      inputSize = "default",
      state,

      // Value
      value,
      onChange,
      placeholder = "Pick a date",
      displayFormat = "PPP",

      // Calendar props
      minDate,
      maxDate,
      disabledDates,

      // Clearable
      clearable = false,

      // Styling
      wrapperClassName,
      groupClassName,
      className,

      // Native
      disabled,
      readOnly,
      name,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);

    const selectedDate = parseDate(value);

    const handleSelect = (date: Date | undefined) => {
      if (readOnly) return;
      if (date) {
        const formatted = format(date, "yyyy-MM-dd");
        onChange?.(formatted);
      }
      setOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (readOnly || disabled) return;
      onChange?.("");
    };

    // Build disabled matcher for calendar
    const disabledMatcher: Matcher[] = [];
    if (minDate) {
      const min = parseDate(minDate);
      if (min) disabledMatcher.push({ before: min });
    }
    if (maxDate) {
      const max = parseDate(maxDate);
      if (max) disabledMatcher.push({ after: max });
    }
    if (disabledDates) {
      disabledDates.forEach((dateStr: string) => {
        const parsed = parseDate(dateStr);
        if (parsed) disabledMatcher.push(parsed);
      });
    }

    return (
      <div className={cn("w-full", wrapperClassName)}>
        {/* ── Title / Label ───────────────────────────── */}
        {title && (
          <label className="al-input-title">
            {title}
            {isRequired && <span className="al-input-required">*</span>}
          </label>
        )}

        {/* Hidden input for form compatibility */}
        {name && <input type="hidden" name={name} value={value ?? ""} />}

        {/* ── Popover + Calendar ───────────────────────── */}
        <Popover open={open} onOpenChange={(o) => !readOnly && !disabled && setOpen(o)}>
          <PopoverTrigger asChild>
            <button
              ref={ref}
              type="button"
              disabled={disabled}
              className={cn(
                "al-input-group w-full",
                sizeClass(inputSize),
                fontClass(inputSize),
                stateClass(state, error),
                disabled && "al-input-group--disabled",
                groupClassName
              )}
            >
              <span
                className={cn(
                  "al-input-addon al-input-addon--icon al-input-addon--start"
                )}
              >
                <CalendarIcon className="h-4 w-4" />
              </span>

              <span
                className={cn(
                  "al-input-field text-left pl-0",
                  !selectedDate && "text-muted-foreground",
                  className
                )}
              >
                {selectedDate
                  ? format(selectedDate, displayFormat)
                  : placeholder}
              </span>

              {clearable && selectedDate && !disabled && !readOnly && (
                <span
                  className="al-input-addon al-input-addon--icon al-input-addon--end al-input-addon--clickable"
                  role="button"
                  tabIndex={0}
                  onClick={handleClear}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleClear(e as unknown as React.MouseEvent);
                    }
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </span>
              )}
            </button>
          </PopoverTrigger>

          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              captionLayout="dropdown"
              selected={selectedDate}
              onSelect={handleSelect}
              defaultMonth={selectedDate ?? new Date()}
              disabled={disabledMatcher.length > 0 ? disabledMatcher : undefined}
              fromYear={2020}
              toYear={2030}
            />
          </PopoverContent>
        </Popover>

        {/* ── Error / Description ─────────────────────── */}
        {error && <span className="al-input-error">{error}</span>}
        {!error && description && (
          <span className="al-input-description">{description}</span>
        )}
      </div>
    );
  }
);

ALDatePicker.displayName = "ALDatePicker";

export { ALDatePicker };
