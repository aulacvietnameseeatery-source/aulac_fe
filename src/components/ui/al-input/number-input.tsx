"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { forwardRef, useCallback, useEffect, useRef, useState, type FocusEvent } from "react";
import { NumericFormat, type NumericFormatProps } from "react-number-format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface NumberInputProps
  extends Omit<NumericFormatProps, "value" | "onValueChange"> {
  showStepper?: boolean;
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
      showStepper = true,
      thousandSeparator,
      placeholder,
      defaultValue,
      min = -Infinity,
      max = Infinity,
      onValueChange,
      fixedDecimalScale = false,
      decimalScale,
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
    const inputElementRef = useRef<HTMLInputElement | null>(null);

    const setInputRef = useCallback((element: HTMLInputElement | null) => {
      inputElementRef.current = element;

      if (typeof ref === "function") {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    }, [ref]);

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
      const handleKeyDown = (e: KeyboardEvent) => {
        if (document.activeElement === inputElementRef.current) {
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
        if (value < min) {
          applyValue(min);
          if (inputElementRef.current) inputElementRef.current.value = String(min);
        } else if (value > max) {
          applyValue(max);
          if (inputElementRef.current) inputElementRef.current.value = String(max);
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
          onBlur={handleBlur}
          max={max}
          min={min}
          suffix={suffix}
          prefix={prefix}
          customInput={Input}
          placeholder={placeholder}
          className="h-full w-full rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          getInputRef={setInputRef}
          {...props}
        />

        {showStepper && (
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
        )}
      </div>
    );
  },
);

NumberInput.displayName = "NumberInput";
