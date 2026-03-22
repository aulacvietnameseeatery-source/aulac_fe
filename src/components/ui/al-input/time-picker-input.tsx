import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type TimePeriod = "AM" | "PM";

const HOURS_12 = Array.from({ length: 12 }, (_, index) =>
  String(index + 1).padStart(2, "0")
);

const HOURS_24 = Array.from({ length: 24 }, (_, index) =>
  String(index).padStart(2, "0")
);

interface TimePickerInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  title?: string;
  timeUse12Hour?: boolean;
  timeMinuteStep?: number;
}

function normalizeTimeValue(value: string | undefined): string {
  if (!value) return "";
  return value.slice(0, 5);
}

function parseTimeParts(value: string) {
  const normalized = normalizeTimeValue(value);
  if (!normalized) {
    return { hour24: 0, minute: 0 };
  }

  const [hourRaw, minuteRaw] = normalized.split(":");
  const hour24 = Number(hourRaw);
  const minute = Number(minuteRaw);

  return {
    hour24: Number.isNaN(hour24) ? 0 : Math.min(23, Math.max(0, hour24)),
    minute: Number.isNaN(minute) ? 0 : Math.min(59, Math.max(0, minute)),
  };
}

function to24HourFrom12(hour12: number, period: TimePeriod): number {
  if (period === "AM") return hour12 === 12 ? 0 : hour12;
  return hour12 === 12 ? 12 : hour12 + 12;
}

function toTimeValue(hour24: number, minute: number): string {
  const hour = String(Math.min(23, Math.max(0, hour24))).padStart(2, "0");
  const mins = String(Math.min(59, Math.max(0, minute))).padStart(2, "0");
  return `${hour}:${mins}`;
}

function formatDisplayTime(value: string, use12Hour: boolean): string {
  const normalized = normalizeTimeValue(value);
  if (!normalized) return "";

  if (!use12Hour) return normalized;

  const { hour24, minute } = parseTimeParts(normalized);
  const period: TimePeriod = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

  return `${String(hour12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;
}

function resolveMinuteStep(
  timeMinuteStep: number | undefined,
  nativeStep: string | number | undefined
): number {
  if (typeof timeMinuteStep === "number" && Number.isFinite(timeMinuteStep)) {
    return Math.min(30, Math.max(1, Math.round(timeMinuteStep)));
  }

  if (nativeStep !== undefined) {
    const parsedStep = Number(nativeStep);
    if (!Number.isNaN(parsedStep) && parsedStep > 0) {
      const minuteStep = Math.floor(parsedStep / 60);
      if (minuteStep > 0) {
        return Math.min(30, Math.max(1, minuteStep));
      }
    }
  }

  return 1;
}

function sanitizeTypedTime(value: string): string {
  return value.replace(/[^0-9apm:\s]/gi, "").slice(0, 8);
}

function formatTypingPreview(
  value: string,
  use12Hour: boolean,
  fallbackPeriod: TimePeriod
): string {
  const normalized = value.toUpperCase();
  const periodMatch = normalized.match(/\b(AM|PM)\b/);
  const nextPeriod = (periodMatch?.[1] as TimePeriod | undefined) ?? fallbackPeriod;
  const digits = normalized.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (use12Hour) {
    const hourRaw = Number(digits.slice(0, 2));
    const hour = Number.isNaN(hourRaw) ? 0 : Math.min(12, Math.max(0, hourRaw));

    const hasExplicitPeriod = Boolean(periodMatch);

    if (digits.length <= 2) {
      return hasExplicitPeriod
        ? `${String(hour).padStart(2, "0")}: ${nextPeriod}`
        : `${String(hour).padStart(2, "0")}:`;
    }

    const minuteRaw = Number(digits.slice(2, 4));
    const minute = Number.isNaN(minuteRaw) ? 0 : Math.min(59, Math.max(0, minuteRaw));
    return hasExplicitPeriod
      ? `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${nextPeriod}`
      : `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }

  const hourRaw = Number(digits.slice(0, 2));
  const hour = Number.isNaN(hourRaw) ? 0 : Math.min(24, Math.max(0, hourRaw));

  if (digits.length <= 2) {
    return `${String(hour).padStart(2, "0")}:`;
  }

  const minuteRaw = Number(digits.slice(2, 4));
  const minute = Number.isNaN(minuteRaw) ? 0 : Math.min(59, Math.max(0, minuteRaw));
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function tryParseTypedTime(
  value: string,
  currentPeriod: TimePeriod,
  use12Hour: boolean
): string | null {
  const normalized = value.trim().replace(/\s+/g, " ").toUpperCase();
  const match = normalized.match(/^(\d{1,2})(?::?(\d{2}))?(?:\s*(AM|PM))?$/);
  if (!match) return null;

  const hour = Number(match[1]);
  const minute = match[2] ? Number(match[2]) : 0;

  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  if (minute < 0 || minute > 59) return null;

  if (use12Hour) {
    if (hour < 1 || hour > 12) return null;
    const period = (match[3] as TimePeriod | undefined) ?? currentPeriod;
    return toTimeValue(to24HourFrom12(hour, period), minute);
  }

  if (hour < 0 || hour > 23) return null;
  return toTimeValue(hour, minute);
}

const TimePickerInput = React.forwardRef<HTMLInputElement, TimePickerInputProps>(
  (
    {
      className,
      disabled,
      readOnly,
      placeholder,
      title,
      value,
      defaultValue,
      onChange,
      onBlur,
      onFocus,
      onKeyDown,
      name,
      required,
      step,
      autoComplete,
      autoCorrect,
      spellCheck,
      timeUse12Hour = true,
      timeMinuteStep,
      ...inputProps
    },
    ref
  ) => {
    const isControlled = typeof value === "string";
    const [open, setOpen] = React.useState(false);
    const [internalTimeValue, setInternalTimeValue] = React.useState<string>(() =>
      normalizeTimeValue(
        typeof value === "string"
          ? value
          : typeof defaultValue === "string"
            ? defaultValue
            : ""
      )
    );

    const currentTime = normalizeTimeValue(
      isControlled ? (value as string) : internalTimeValue
    );
    const parsed = parseTimeParts(currentTime);
    const period: TimePeriod = parsed.hour24 >= 12 ? "PM" : "AM";
    const hour12 = parsed.hour24 % 12 === 0 ? 12 : parsed.hour24 % 12;
    const currentMinute = String(parsed.minute).padStart(2, "0");
    const [timeTextValue, setTimeTextValue] = React.useState(
      formatDisplayTime(currentTime, timeUse12Hour)
    );

    const hiddenInputRef = React.useRef<HTMLInputElement | null>(null);
    const hourColumnRef = React.useRef<HTMLDivElement | null>(null);
    const minuteColumnRef = React.useRef<HTMLDivElement | null>(null);
    const periodColumnRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
      if (isControlled) {
        setInternalTimeValue(normalizeTimeValue(value));
      }
    }, [isControlled, value]);

    React.useEffect(() => {
      setTimeTextValue(formatDisplayTime(currentTime, timeUse12Hour));
    }, [currentTime, timeUse12Hour]);

    const setRefs = React.useCallback(
      (node: HTMLInputElement | null) => {
        hiddenInputRef.current = node;
        if (typeof ref === "function") {
          ref(node);
          return;
        }
        if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    const emitChange = React.useCallback(
      (nextValue: string) => {
        if (!isControlled) {
          setInternalTimeValue(nextValue);
        }

        if (hiddenInputRef.current && hiddenInputRef.current.value !== nextValue) {
          hiddenInputRef.current.value = nextValue;
        }

        onChange?.({
          target: {
            value: nextValue,
            name: name ?? "",
          },
          currentTarget: {
            value: nextValue,
            name: name ?? "",
          },
        } as React.ChangeEvent<HTMLInputElement>);
      },
      [isControlled, name, onChange]
    );

    const emitBlur = React.useCallback(
      (nextValue: string) => {
        onBlur?.({
          target: {
            value: nextValue,
            name: name ?? "",
          },
          currentTarget: {
            value: nextValue,
            name: name ?? "",
          },
        } as React.FocusEvent<HTMLInputElement>);
      },
      [name, onBlur]
    );

    const minuteStep = React.useMemo(
      () => resolveMinuteStep(timeMinuteStep, step),
      [timeMinuteStep, step]
    );

    const minuteOptions = React.useMemo(() => {
      const items: string[] = [];
      for (let minute = 0; minute < 60; minute += minuteStep) {
        items.push(String(minute).padStart(2, "0"));
      }

      if (items.length === 0) items.push("00");
      if (!items.includes(currentMinute)) {
        items.push(currentMinute);
        items.sort((left, right) => Number(left) - Number(right));
      }

      return items;
    }, [currentMinute, minuteStep]);

    const updateTimeFromDial = React.useCallback(
      (hour24: number, minute: number) => {
        emitChange(toTimeValue(hour24, minute));
      },
      [emitChange]
    );

    React.useEffect(() => {
      if (!open) return;

      const scrollSelectedIntoView = (container: HTMLDivElement | null) => {
        const selectedItem = container?.querySelector<HTMLElement>("[data-time-selected='true']");
        selectedItem?.scrollIntoView({ block: "center" });
      };

      const timer = window.setTimeout(() => {
        scrollSelectedIntoView(hourColumnRef.current);
        scrollSelectedIntoView(minuteColumnRef.current);
        scrollSelectedIntoView(periodColumnRef.current);
      }, 20);

      return () => window.clearTimeout(timer);
    }, [open, hour12, currentMinute, parsed.hour24, period, timeUse12Hour]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextText = sanitizeTypedTime(event.target.value);
      const previewText = formatTypingPreview(nextText, timeUse12Hour, period);
      setTimeTextValue(previewText);
    };

    const handleInputFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      onFocus?.(event);
    };

    const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if ((event.key === "ArrowDown" || event.key === "Enter") && !disabled && !readOnly) {
        setOpen(true);
      }
      onKeyDown?.(event);
    };

    const handleInputBlur = () => {
      const parsedTime = tryParseTypedTime(timeTextValue, period, timeUse12Hour);
      const nextValue = parsedTime ?? currentTime;

      if (parsedTime) {
        emitChange(parsedTime);
      }

      setTimeTextValue(formatDisplayTime(nextValue, timeUse12Hour));
      emitBlur(nextValue);
    };

    return (
      <>
        <Popover
          open={open}
          onOpenChange={(nextOpen) => {
            if (disabled || readOnly) return;
            setOpen(nextOpen);
          }}
        >
          <PopoverTrigger asChild>
            <input
              {...inputProps}
              type="text"
              disabled={disabled}
              readOnly={readOnly}
              className={cn("al-input-field al-input-time-trigger", className)}
              value={timeTextValue}
              placeholder={placeholder ?? (timeUse12Hour ? "hh:mm am/pm" : "hh:mm")}
              autoComplete={autoComplete}
              autoCorrect={autoCorrect}
              spellCheck={spellCheck}
              onFocus={handleInputFocus}
              onKeyDown={handleInputKeyDown}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              aria-label={title ?? "Time"}
              aria-readonly={readOnly}
            />
          </PopoverTrigger>

          <PopoverContent
            align="start"
            className="border-[#D5BA98]/60 bg-white p-1 shadow-md"
            style={{ width: "var(--radix-popover-trigger-width)" }}
          >
            <div
              className="al-time-grid h-32 bg-[#FDFBF9]"
              style={{
                gridTemplateColumns: timeUse12Hour
                  ? "repeat(3, minmax(0, 1fr))"
                  : "repeat(2, minmax(0, 1fr))",
              }}
            >
              <div
                ref={hourColumnRef}
                className="al-time-column no-scrollbar"
                role="listbox"
                aria-label="Hour"
              >
                {(timeUse12Hour ? HOURS_12 : HOURS_24).map((hour) => {
                  const isSelected = timeUse12Hour
                    ? hour === String(hour12).padStart(2, "0")
                    : hour === String(parsed.hour24).padStart(2, "0");

                  return (
                    <button
                      key={hour}
                      type="button"
                      data-time-selected={String(isSelected)}
                      className={cn(
                        "al-time-option",
                        isSelected && "al-time-option--selected"
                      )}
                      onClick={() => {
                        if (timeUse12Hour) {
                          updateTimeFromDial(
                            to24HourFrom12(Number(hour), period),
                            parsed.minute
                          );
                          return;
                        }

                        updateTimeFromDial(Number(hour), parsed.minute);
                      }}
                      disabled={disabled || readOnly}
                    >
                      {timeUse12Hour ? Number(hour) : hour}
                    </button>
                  );
                })}
              </div>

              <div
                ref={minuteColumnRef}
                className="al-time-column no-scrollbar"
                role="listbox"
                aria-label="Minute"
              >
                {minuteOptions.map((minute) => (
                  <button
                    key={minute}
                    type="button"
                    data-time-selected={String(minute === currentMinute)}
                    className={cn(
                      "al-time-option",
                      minute === currentMinute && "al-time-option--selected"
                    )}
                    onClick={() => updateTimeFromDial(parsed.hour24, Number(minute))}
                    disabled={disabled || readOnly}
                  >
                    {minute}
                  </button>
                ))}
              </div>

              {timeUse12Hour && (
                <div
                  ref={periodColumnRef}
                  className="al-time-column no-scrollbar"
                  role="listbox"
                  aria-label="Period"
                >
                  {(["AM", "PM"] as TimePeriod[]).map((periodOption) => (
                    <button
                      key={periodOption}
                      type="button"
                      data-time-selected={String(periodOption === period)}
                      className={cn(
                        "al-time-option",
                        periodOption === period && "al-time-option--selected"
                      )}
                      onClick={() =>
                        updateTimeFromDial(
                          to24HourFrom12(hour12, periodOption),
                          parsed.minute
                        )
                      }
                      disabled={disabled || readOnly}
                    >
                      {periodOption}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <input
          ref={setRefs}
          type="time"
          name={name}
          required={required}
          readOnly
          disabled={disabled}
          value={currentTime}
          step={step}
          className="hidden"
          tabIndex={-1}
          aria-hidden="true"
        />
      </>
    );
  }
);

TimePickerInput.displayName = "TimePickerInput";

export { TimePickerInput };