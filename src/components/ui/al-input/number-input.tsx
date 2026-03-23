"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { forwardRef, useCallback, useEffect, useState, type FocusEvent, type RefObject } from "react";
import { NumericFormat, type NumericFormatProps } from "react-number-format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface NumberInputProps
  extends Omit<NumericFormatProps, "value" | "onValueChange"> {
  stepper?: number;
  thousandSeparator?: NumericFormatProps["thousandSeparator"];
  placeholder?: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  value?: number;
  suffix?: string;
  prefix?: string;
  onValueChange?: (value: number | undefined) => void;
  fixedDecimalScale?: boolean;
  decimalScale?: number;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      stepper,
      thousandSeparator,
      placeholder,
      defaultValue,
      min = -Infinity,
      max = Infinity,
      onValueChange,
      fixedDecimalScale = false,
      decimalScale = 0,
      suffix,
      prefix,
      value: controlledValue,
      className,
      onBlur: onInputBlur,
      ...props
    },
    ref,
  ) => {
    const [value, setValue] = useState<number | undefined>(controlledValue ?? defaultValue);

    const applyValue = useCallback(
      (next: number | undefined) => {
        setValue(next);
        onValueChange?.(next);
      },
      [onValueChange],
    );

    const handleIncrement = useCallback(() => {
      const next = value === undefined ? stepper ?? 1 : Math.min(value + (stepper ?? 1), max);
      applyValue(next);
    }, [stepper, max, value, applyValue]);

    const handleDecrement = useCallback(() => {
      const next = value === undefined ? -(stepper ?? 1) : Math.max(value - (stepper ?? 1), min);
      applyValue(next);
    }, [stepper, min, value, applyValue]);

    useEffect(() => {
      const inputRef = ref as RefObject<HTMLInputElement>;
      const handleKeyDown = (e: KeyboardEvent) => {
        if (document.activeElement === inputRef.current) {
          if (e.key === "ArrowUp") {
            handleIncrement();
          } else if (e.key === "ArrowDown") {
            handleDecrement();
          }
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }, [handleIncrement, handleDecrement, ref]);

    useEffect(() => {
      if (controlledValue !== undefined) {
        setValue(controlledValue);
      }
    }, [controlledValue]);

    const handleChange = (values: { value: string; floatValue: number | undefined }) => {
      const newValue = values.floatValue === undefined ? undefined : values.floatValue;
      applyValue(newValue);
    };

    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
      if (value !== undefined) {
        const inputRef = ref as RefObject<HTMLInputElement>;
        if (value < min) {
          applyValue(min);
          if (inputRef.current) inputRef.current.value = String(min);
        } else if (value > max) {
          applyValue(max);
          if (inputRef.current) inputRef.current.value = String(max);
        }
      }

      onInputBlur?.(e);
    };

    return (
      <div className={`flex h-11 w-full items-stretch overflow-hidden rounded-md border border-navy-DEFAULT/20 bg-white shadow-sm focus-within:border-gold-classic focus-within:ring-1 focus-within:ring-gold-classic ${className ?? ""}`}>
        <NumericFormat
          value={value}
          onValueChange={handleChange}
          thousandSeparator={thousandSeparator}
          decimalScale={decimalScale}
          fixedDecimalScale={fixedDecimalScale}
          allowNegative={min < 0}
          valueIsNumericString
          onBlur={handleBlur}
          max={max}
          min={min}
          suffix={suffix}
          prefix={prefix}
          customInput={Input}
          placeholder={placeholder}
          className="h-full w-full rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          getInputRef={ref}
          {...props}
        />

        <div className="flex w-9 flex-col border-l border-navy-DEFAULT/20 bg-[#FDFBF9]">
          <Button
            aria-label="Increase value"
            className="h-1/2 w-full rounded-none border-0 border-b border-navy-DEFAULT/20 px-0 hover:bg-[#D5BA98]/20"
            variant="ghost"
            onClick={handleIncrement}
            disabled={value === max}
            type="button"
          >
            <ChevronUp size={14} className="text-[#1A3A52]/70" />
          </Button>
          <Button
            aria-label="Decrease value"
            className="h-1/2 w-full rounded-none border-0 px-0 hover:bg-[#D5BA98]/20"
            variant="ghost"
            onClick={handleDecrement}
            disabled={value === min}
            type="button"
          >
            <ChevronDown size={14} className="text-[#1A3A52]/70" />
          </Button>
        </div>
      </div>
    );
  },
);

NumberInput.displayName = "NumberInput";
