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

const ALInput = React.forwardRef<HTMLInputElement, ALInputProps>(
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
      timeUse12Hour = true,
      timeMinuteStep,

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
    return (
      <div className={cn("w-full", wrapperClassName)}>
        {/* ── Title / Label ───────────────────────────── */}
        {title && (
          <label className="al-input-title">
            {title}
            {isRequired && <span className="al-input-required">*</span>}
          </label>
        )}

        {/* ── Input Group Row ─────────────────────────── */}
        <div
          className={cn(
            "al-input-group",
            sizeClass(inputSize),
            fontClass(inputSize),
            stateClass(state, error),
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
              ref={ref}
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
          ) : (
            <input
              {...inputProps}
              ref={ref}
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

        {/* ── Error / Description ─────────────────────── */}
        {error && <span className="al-input-error">{error}</span>}
        {!error && description && (
          <span className="al-input-description">{description}</span>
        )}
      </div>
    );
  }
);

ALInput.displayName = "ALInput";

export { ALInput };
