"use client";

import * as React from "react";
import { CalendarIcon, X } from "lucide-react";
import { format, getMonth, getYear, isValid, parse } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { ALCombobox } from "@/components/ui/al-combobox";
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
    sm: "text-md bold",
    default: "text-lg bold",
    lg: "text-xl bold",
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
      displayFormat = "dd/MM/yyyy",

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

    const selectedDate = React.useMemo(() => parseDate(value), [value]);
    const [visibleMonth, setVisibleMonth] = React.useState<Date>(
      selectedDate ?? new Date()
    );

    React.useEffect(() => {
      if (selectedDate) {
        setVisibleMonth((prev) => {
          const sameMonth =
            prev.getFullYear() === selectedDate.getFullYear() &&
            prev.getMonth() === selectedDate.getMonth();
          return sameMonth ? prev : selectedDate;
        });
      }
    }, [selectedDate]);

    const minParsed = parseDate(minDate);
    const maxParsed = parseDate(maxDate);
    const fromYear = minParsed ? getYear(minParsed) : 2020;
    const toYear = maxParsed ? getYear(maxParsed) : 2030;

    const monthOptions = React.useMemo(
      () =>
        Array.from({ length: 12 }, (_, index) => ({
          label: format(new Date(2000, index, 1), "MMMM"),
          value: String(index),
        })),
      []
    );

    const yearOptions = React.useMemo(
      () =>
        Array.from({ length: Math.max(1, toYear - fromYear + 1) }, (_, index) => {
          const year = fromYear + index;
          return {
            label: String(year),
            value: String(year),
          };
        }),
      [fromYear, toYear]
    );

    const handleMonthChange = (val: string | number | (string | number)[] | undefined) => {
      if (Array.isArray(val) || val === undefined || val === "") return;
      const nextMonth = Number(val);
      if (Number.isNaN(nextMonth)) return;

      setVisibleMonth((prev) => new Date(getYear(prev), nextMonth, 1));
    };

    const handleYearChange = (val: string | number | (string | number)[] | undefined) => {
      if (Array.isArray(val) || val === undefined || val === "") return;
      const nextYear = Number(val);
      if (Number.isNaN(nextYear)) return;

      setVisibleMonth((prev) => new Date(nextYear, getMonth(prev), 1));
    };

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
                  "al-input-field flex items-center text-left pl-0",
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

          <PopoverContent className="w-[320px] p-0 border-[#D5BA98]/50" align="start">
            <div className="grid grid-cols-2 gap-2 p-3 border-b border-[#D5BA98]/30">
              <ALCombobox
                options={monthOptions}
                value={String(getMonth(visibleMonth))}
                onChange={handleMonthChange}
                inputSize="sm"
                searchable={false}
                placeholder="Month"
              />
              <ALCombobox
                options={yearOptions}
                value={String(getYear(visibleMonth))}
                onChange={handleYearChange}
                inputSize="sm"
                searchable={false}
                placeholder="Year"
              />
            </div>
            <Calendar
              mode="single"
              className="w-full"
              captionLayout="label"
              selected={selectedDate}
              onSelect={handleSelect}
              month={visibleMonth}
              onMonthChange={setVisibleMonth}
              disabled={disabledMatcher.length > 0 ? disabledMatcher : undefined}
              fromYear={fromYear}
              toYear={toYear}
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
