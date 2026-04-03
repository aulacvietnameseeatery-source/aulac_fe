import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import "@/styles/components/al-input.css";

import type {
  ALInputProps,
  ALInputDropdownConfig,
  ALInputButtonConfig,
} from "./al-input.types";
import { TimePickerInput } from "./time-picker-input";
import { ALFieldWrapper } from "@/components/ui/al-field-wrapper";
import { NumberInput } from "./number-input";

// ─── Helpers ────────────────────────────────────────────────

/** Map size prop → CSS class */
const sizeClass = (size: ALInputProps["inputSize"] = "default") =>
  ({
    sm: "al-input-group--sm",
    default: "al-input-group--default",
    lg: "al-input-group--lg",
  })[size];

/** Map size prop → font class */
const fontClass = (size: ALInputProps["inputSize"] = "default") =>
  ({
    sm: "text-xs",
    default: "text-sm",
    lg: "text-base",
  })[size];

/** Map size prop → textarea wrapper class */
const textareaSizeClass = (size: ALInputProps["inputSize"] = "default") =>
  ({
    sm: "al-input-textarea-wrap--sm",
    default: "al-input-textarea-wrap--default",
    lg: "al-input-textarea-wrap--lg",
  })[size];

/** Map variant prop → CSS modifier class */
const variantClass = (v: ALInputProps["variant"] = "outline") =>
  ({
    outline: "",
    filled: "al-input--filled",
    ghost: "al-input--ghost",
    underline: "al-input--underline",
  })[v];

/** Map size prop → NumberInput height */
const numberSizeClass = (size: ALInputProps["inputSize"] = "default") =>
  ({
    sm: "h-9",
    default: "h-11",
    lg: "h-12",
  })[size];

/** Map visual state to NumberInput wrapper classes */
const numberStateClass = (
  state: ALInputProps["state"],
  error: ALInputProps["error"]
) => {
  const resolved = error ? "error" : state ?? "default";
  return {
    default: "",
    error: "border-red-500 focus-within:border-red-500 focus-within:ring-red-500",
    success: "border-green-500 focus-within:border-green-500 focus-within:ring-green-500",
  }[resolved];
};

/** Map ALInput variant to NumberInput wrapper classes */
const numberVariantClass = (v: ALInputProps["variant"] = "outline") =>
  ({
    outline: "bg-white",
    filled: "bg-[#1A3A52]/4",
    ghost: "border-transparent bg-transparent",
    underline: "rounded-none border-x-0 border-t-0 bg-transparent",
  })[v];

/** Resolve visual state, auto-detecting error from props */
const stateClass = (
  state: ALInputProps["state"],
  error: ALInputProps["error"]
) => {
  const resolved = error ? "error" : state ?? "default";
  return {
    default: "",
    error: "al-input-group--error",
    success: "al-input-group--success",
  }[resolved];
};

// ─── Sub-components (internal) ──────────────────────────────

/** Icon addon (start / end) */
const IconAddon: React.FC<{
  icon: React.ReactNode;
  position: "start" | "end";
  onClick?: () => void;
}> = ({ icon, position, onClick }) => (
  <span
    className={cn(
      "al-input-addon al-input-addon--icon",
      position === "start" && "al-input-addon--start",
      position === "end" && "al-input-addon--end",
      onClick && "al-input-addon--clickable"
    )}
    role={onClick ? "button" : undefined}
    tabIndex={onClick ? 0 : undefined}
    onClick={onClick}
    onKeyDown={(e) => {
      if (onClick && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        onClick();
      }
    }}
  >
    {icon}
  </span>
);

/** Static text addon */
const TextAddon: React.FC<{
  text: string;
  position: "start" | "end";
}> = ({ text, position }) => (
  <span
    className={cn(
      "al-input-addon",
      position === "start" ? "al-input-addon--start" : "al-input-addon--end"
    )}
  >
    {text}
  </span>
);

/** Dropdown addon */
const DropdownAddon: React.FC<{
  config: ALInputDropdownConfig;
  position: "start" | "end";
}> = ({ config, position }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const raw = e.target.value;
    const parsed = !isNaN(Number(raw)) ? Number(raw) : raw;
    config.onChange?.(parsed);
  };

  return (
    <span
      className={cn(
        "al-input-addon",
        position === "start" ? "al-input-addon--start" : "al-input-addon--end"
      )}
    >
      <select
        className="al-input-dropdown"
        value={config.value ?? ""}
        onChange={handleChange}
      >
        {config.placeholder && (
          <option value="" disabled>
            {config.placeholder}
          </option>
        )}
        {config.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </span>
  );
};

/** Button addon */
const ButtonAddon: React.FC<{
  config: ALInputButtonConfig;
  position: "start" | "end";
}> = ({ config, position }) => {
  const variant = config.variant ?? "default";

  return (
    <button
      type="button"
      className={cn(
        "al-input-btn",
        `al-input-btn--${variant}`,
        position === "start" && "al-input-addon--start",
        position === "end" && "al-input-addon--end",
        config.className
      )}
      onClick={config.onClick}
      disabled={config.isLoading}
    >
      {config.isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {config.icon && !config.isLoading && config.icon}
      {config.label}
    </button>
  );
};

// ─── Main component ─────────────────────────────────────────

const ALInput = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  ALInputProps
>(
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

      // Icon addons
      iconStart,
      iconEnd,
      onIconStartClick,
      onIconEndClick,

      // Text addons
      textStart,
      textEnd,

      // Dropdown addons
      dropdownStart,
      dropdownEnd,

      // Button addons
      buttonStart,
      buttonEnd,

      // Styling
      wrapperClassName,
      groupClassName,
      className,
      fieldVariant = "input",
      variant = "outline",
      textareaRows,
      textareaClassName,
      textareaProps,
      timeUse12Hour = true,
      timeMinuteStep,
      numberStepper,
      numberShowStepper,
      numberThousandSeparator,
      numberPrefix,
      numberSuffix,
      numberFixedDecimalScale,
      numberDecimalScale,

      // Native input
      disabled,
      type,
      onChange,
      onBlur,
      value,
      defaultValue,
      step,
      name,
      required,
      readOnly,
      placeholder,
      autoComplete,
      autoCorrect,
      spellCheck,
      onFocus,
      onKeyDown,
      ...inputProps
    },
    ref
  ) => {
    // Determine if there's anything on each side
    const hasStart = !!(iconStart || textStart || dropdownStart || buttonStart);
    const hasEnd = !!(iconEnd || textEnd || dropdownEnd || buttonEnd);

    const isTimeInput = type === "time";
    const isNumberInput = type === "number";
    const isTextarea = fieldVariant === "textarea";
    const resolvedTextareaRows =
      textareaRows ??
      ({
        sm: 3,
        default: 4,
        lg: 5,
      }[inputSize] ?? 4);

    const rawMin = inputProps.min;
    const rawMax = inputProps.max;
    const minNum = rawMin === undefined ? -Infinity : Number(rawMin);
    const maxNum = rawMax === undefined ? Infinity : Number(rawMax);
    const resolvedMin = Number.isNaN(minNum) ? -Infinity : minNum;
    const resolvedMax = Number.isNaN(maxNum) ? Infinity : maxNum;

    const stepNum = step === undefined ? undefined : Number(step);
    const resolvedStepper =
      typeof numberStepper === "number"
        ? numberStepper
        : Number.isFinite(stepNum)
          ? stepNum
          : undefined;

    const resolvedNumberValue =
      typeof value === "number"
        ? value
        : typeof value === "string" && value.trim() !== ""
          ? Number(value)
          : undefined;

    const safeNumberValue =
      resolvedNumberValue !== undefined && !Number.isNaN(resolvedNumberValue)
        ? resolvedNumberValue
        : undefined;

    const resolvedNumberDefaultValue =
      typeof defaultValue === "number"
        ? defaultValue
        : typeof defaultValue === "string" && defaultValue.trim() !== ""
          ? Number(defaultValue)
          : undefined;

    const emitNativeNumberChange = (next: number | undefined) => {
      if (!onChange) return;
      const nextValue = next === undefined ? "" : String(next);
      const syntheticEvent = {
        target: { value: nextValue, name: name ?? "" },
        currentTarget: { value: nextValue, name: name ?? "" },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    };
    return (
      <ALFieldWrapper
        title={title}
        description={description}
        error={error}
        required={isRequired}
        size={inputSize}
        className={wrapperClassName}
      >
        {/* ── Input Group Row ─────────────────────────── */}
        {isTextarea ? (
          <div
            className={cn(
              "al-input-textarea-wrap",
              textareaSizeClass(inputSize),
              fontClass(inputSize),
              stateClass(state, error),
              variantClass(variant),
              disabled && "al-input-group--disabled",
              groupClassName
            )}
          >
            <textarea
              {...textareaProps}
              ref={ref as React.Ref<HTMLTextAreaElement>}
              name={name}
              required={required}
              readOnly={readOnly}
              disabled={disabled}
              value={value as React.TextareaHTMLAttributes<HTMLTextAreaElement>["value"]}
              defaultValue={defaultValue as React.TextareaHTMLAttributes<HTMLTextAreaElement>["defaultValue"]}
              onChange={onChange as unknown as React.ChangeEventHandler<HTMLTextAreaElement>}
              onBlur={onBlur as unknown as React.FocusEventHandler<HTMLTextAreaElement>}
              rows={resolvedTextareaRows}
              placeholder={placeholder}
              autoComplete={autoComplete}
              autoCorrect={autoCorrect}
              spellCheck={spellCheck}
              onFocus={onFocus as unknown as React.FocusEventHandler<HTMLTextAreaElement>}
              onKeyDown={onKeyDown as unknown as React.KeyboardEventHandler<HTMLTextAreaElement>}
              className={cn(
                "al-input-textarea",
                className,
                textareaClassName,
                textareaProps?.className
              )}
            />
          </div>
        ) : (
          <div
            className={cn(
              "al-input-group",
              sizeClass(inputSize),
              fontClass(inputSize),
              stateClass(state, error),
              variantClass(variant),
              disabled && "al-input-group--disabled",
              groupClassName
            )}
          >
          {/* Start addons — rendered in order of priority */}
          {iconStart && (
            <IconAddon
              icon={iconStart}
              position="start"
              onClick={onIconStartClick}
            />
          )}
          {textStart && <TextAddon text={textStart} position="start" />}
          {dropdownStart && (
            <DropdownAddon config={dropdownStart} position="start" />
          )}
          {buttonStart && (
            <ButtonAddon config={buttonStart} position="start" />
          )}

          {/* ── The actual input field ──────────────── */}
          {isTimeInput ? (
            <TimePickerInput
              {...inputProps}
              ref={ref as unknown as React.Ref<HTMLInputElement>}
              className={cn(
                "al-input-field al-input-time-trigger",
                hasStart && "pl-0",
                hasEnd && "pr-0",
                className
              )}
              disabled={disabled}
              readOnly={readOnly}
              placeholder={placeholder}
              title={title}
              value={value as string | undefined}
              defaultValue={defaultValue as string | undefined}
              onChange={onChange}
              onBlur={onBlur}
              onFocus={onFocus}
              onKeyDown={onKeyDown}
              name={name}
              required={required}
              step={step}
              autoComplete={autoComplete}
              autoCorrect={autoCorrect}
              spellCheck={spellCheck}
              timeUse12Hour={timeUse12Hour}
              timeMinuteStep={timeMinuteStep}
            />
          ) : isNumberInput ? (
            <NumberInput
              {...inputProps}
              ref={ref as React.Ref<HTMLInputElement>}
              value={safeNumberValue}
              defaultValue={
                resolvedNumberDefaultValue !== undefined && !Number.isNaN(resolvedNumberDefaultValue)
                  ? resolvedNumberDefaultValue
                  : undefined
              }
              onValueChange={emitNativeNumberChange}
              onBlur={onBlur as React.FocusEventHandler<HTMLInputElement>}
              placeholder={placeholder}
              disabled={disabled || readOnly}
              min={resolvedMin}
              max={resolvedMax}
              stepper={resolvedStepper}
              showStepper={numberShowStepper}
              thousandSeparator={numberThousandSeparator}
              prefix={numberPrefix}
              suffix={numberSuffix}
              fixedDecimalScale={numberFixedDecimalScale}
              decimalScale={numberDecimalScale}
              className={cn(
                numberSizeClass(inputSize),
                numberStateClass(state, error),
                numberVariantClass(variant),
                className
              )}
            />
          ) : (
            <input
              {...inputProps}
              ref={ref as unknown as React.Ref<HTMLInputElement>}
              type={type}
              name={name}
              required={required}
              readOnly={readOnly}
              disabled={disabled}
              value={value}
              defaultValue={defaultValue}
              onChange={onChange}
              onBlur={onBlur}
              step={step}
              className={cn(
                "al-input-field",
                // Remove left padding when there's a start addon icon
                hasStart && "pl-0",
                hasEnd && "pr-0",
                className
              )}
            />
          )}

          {/* End addons — rendered in order of priority */}
          {iconEnd && (
            <IconAddon
              icon={iconEnd}
              position="end"
              onClick={onIconEndClick}
            />
          )}
          {textEnd && <TextAddon text={textEnd} position="end" />}
          {dropdownEnd && (
            <DropdownAddon config={dropdownEnd} position="end" />
          )}
          {buttonEnd && <ButtonAddon config={buttonEnd} position="end" />}
          </div>
        )}

      </ALFieldWrapper>
    );
  }
);

ALInput.displayName = "ALInput";

export { ALInput };
