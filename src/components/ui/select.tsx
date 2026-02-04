import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
    label: string;
    value: string | number;
}

export interface SelectProps {
    value?: string | number | null;
    options: SelectOption[];
    onChange?: (value: string | number) => void;
    placeholder?: string;
    className?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ value, options, onChange, placeholder, className, ...props }, ref) => {
        const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
            const newValue = event.target.value;
            // Try to convert to number if it's a numeric string
            const parsedValue = !isNaN(Number(newValue)) ? Number(newValue) : newValue;
            onChange?.(parsedValue);
        };

        return (
            <select
                ref={ref}
                value={value ?? ''}
                onChange={handleChange}
                className={cn(
                    "flex h-11 w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm transition-colors",
                    "border-navy-DEFAULT/20 text-navy-DEFAULT",
                    "focus-visible:outline-none focus-visible:border-gold-classic focus-visible:ring-1 focus-visible:ring-gold-classic",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                {...props}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        );
    }
);

Select.displayName = "Select";

export { Select };
