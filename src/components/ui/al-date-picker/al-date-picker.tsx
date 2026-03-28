"use client";

import * as React from "react";
import { CalendarIcon, X } from "lucide-react";
import { format, getMonth, getYear, isValid, parse } from "date-fns";
import { useTranslations } from "next-intl";
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
import { ALFieldWrapper } from "@/components/ui/al-field-wrapper";

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

function parseDateTime(value: string | undefined): Date | undefined {
  if (!value) return undefined;

  const withSeconds = parse(value, "yyyy-MM-dd'T'HH:mm:ss", new Date());
  if (isValid(withSeconds)) return withSeconds;

  const withoutSeconds = parse(value, "yyyy-MM-dd'T'HH:mm", new Date());
  if (isValid(withoutSeconds)) return withoutSeconds;

  const fallback = new Date(value);
  return isValid(fallback) ? fallback : undefined;
}

function formatOutputDate(date: Date, variant: "date" | "datetime"): string {
  if (variant === "datetime") {
    return format(date, "yyyy-MM-dd'T'HH:mm:ss");
  }

  return format(date, "yyyy-MM-dd");
}

function to24Hour(hour12: number, period: "AM" | "PM"): number {
  if (period === "AM") return hour12 === 12 ? 0 : hour12;
  return hour12 === 12 ? 12 : hour12 + 12;
}

function to12HourParts(date: Date) {
  const hour24 = date.getHours();
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const period: "AM" | "PM" = hour24 >= 12 ? "PM" : "AM";

  return {
    hour: String(hour12).padStart(2, "0"),
    minute: String(date.getMinutes()).padStart(2, "0"),
    period,
  };
}

function applyTimeToDate(
  date: Date,
  hour12Text: string,
  minuteText: string,
  period: "AM" | "PM"
): Date {
  const next = new Date(date);
  const hour12 = Math.min(12, Math.max(1, Number(hour12Text) || 12));
  const minute = Math.min(59, Math.max(0, Number(minuteText) || 0));
  next.setHours(to24Hour(hour12, period), minute, 0, 0);
  return next;
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
      variant = "date",
      value,
      onChange,
      placeholder,
      displayFormat,
      timeStepMinutes = 5,

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
    const isDateTime = variant === "datetime";
    const tDatePicker = useTranslations("common.datePicker");
    const resolvedPlaceholder =
      placeholder ?? (isDateTime ? tDatePicker("placeholderWithTime") : tDatePicker("placeholder"));
    const resolvedDisplayFormat =
      displayFormat ?? (isDateTime ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy");

    const selectedDate = React.useMemo(
      () => (isDateTime ? parseDateTime(value) : parseDate(value)),
      [value, isDateTime]
    );
    const [visibleMonth, setVisibleMonth] = React.useState<Date>(
      selectedDate ?? new Date()
    );
    const [timeHour, setTimeHour] = React.useState("09");
    const [timeMinute, setTimeMinute] = React.useState("00");
    const [timePeriod, setTimePeriod] = React.useState<"AM" | "PM">("AM");

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

    React.useEffect(() => {
      if (!isDateTime || !selectedDate) return;
      const next = to12HourParts(selectedDate);
      setTimeHour(next.hour);
      setTimeMinute(next.minute);
      setTimePeriod(next.period);
    }, [isDateTime, selectedDate]);

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
        const withTime = isDateTime
          ? applyTimeToDate(date, timeHour, timeMinute, timePeriod)
          : date;
        const formatted = formatOutputDate(withTime, variant);
        onChange?.(formatted);

        if (!isDateTime) {
          setOpen(false);
        }
      }
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

    const minuteStep = Math.min(30, Math.max(1, Math.round(timeStepMinutes)));
    const minuteOptions = React.useMemo(() => {
      const values: string[] = [];
      for (let minute = 0; minute < 60; minute += minuteStep) {
        values.push(String(minute).padStart(2, "0"));
      }
      if (!values.includes(timeMinute)) {
        values.push(timeMinute);
        values.sort((a, b) => Number(a) - Number(b));
      }
      return values;
    }, [minuteStep, timeMinute]);

    const hourOptions = React.useMemo(
      () => Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")),
      []
    );

    const emitDateTimeChange = (nextHour: string, nextMinute: string, nextPeriod: "AM" | "PM") => {
      if (!selectedDate) return;
      const nextDate = applyTimeToDate(selectedDate, nextHour, nextMinute, nextPeriod);
      onChange?.(formatOutputDate(nextDate, "datetime"));
    };

    // _OLD: inline label/error/description rendering, now unified via ALFieldWrapper
    return (
      <ALFieldWrapper
        title={title}
        description={description}
        error={error}
        required={isRequired}
        size={inputSize}
        className={wrapperClassName}
      >
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
                  ? format(selectedDate, resolvedDisplayFormat)
                  : resolvedPlaceholder}
              </span>

              {clearable && selectedDate && !disabled && !readOnly && (
                <span
                  className="al-input-addon al-input-addon--icon al-input-addon--end al-input-addon--clickable"
                  role="button"
                  tabIndex={0}
                  data-tooltip-content={tDatePicker("clear")}
                  data-tooltip-id="my-tooltip"
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

          <PopoverContent className="z-320 w-[320px] p-0 border-[#D5BA98]/50" align="start">
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

            {isDateTime && (
              <div className="border-t border-[#D5BA98]/30 p-3">
                <p className="mb-1.5 text-xs font-medium text-[#1A3A52]/75">Time</p>
                <div className="al-time-grid h-10 rounded-md border border-[#D5BA98]/50">
                  <select
                    className="al-time-select"
                    value={timeHour}
                    onChange={(e) => {
                      const next = e.target.value;
                      setTimeHour(next);
                      emitDateTimeChange(next, timeMinute, timePeriod);
                    }}
                    disabled={disabled || readOnly}
                    aria-label="Hour"
                  >
                    {hourOptions.map((hour) => (
                      <option key={hour} value={hour}>
                        {Number(hour)}
                      </option>
                    ))}
                  </select>

                  <select
                    className="al-time-select"
                    value={timeMinute}
                    onChange={(e) => {
                      const next = e.target.value;
                      setTimeMinute(next);
                      emitDateTimeChange(timeHour, next, timePeriod);
                    }}
                    disabled={disabled || readOnly}
                    aria-label="Minute"
                  >
                    {minuteOptions.map((minute) => (
                      <option key={minute} value={minute}>
                        {minute}
                      </option>
                    ))}
                  </select>

                  <select
                    className="al-time-select"
                    value={timePeriod}
                    onChange={(e) => {
                      const next = e.target.value as "AM" | "PM";
                      setTimePeriod(next);
                      emitDateTimeChange(timeHour, timeMinute, next);
                    }}
                    disabled={disabled || readOnly}
                    aria-label="Period"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
            )}
          </PopoverContent>
        </Popover>

      </ALFieldWrapper>
    );
  }
);

ALDatePicker.displayName = "ALDatePicker";

export { ALDatePicker };
