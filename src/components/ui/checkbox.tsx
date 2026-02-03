import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, checked, onCheckedChange, onChange, ...props }, ref) => {
        const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            onCheckedChange?.(event.target.checked);
            onChange?.(event);
        };

        return (
            <label className="flex items-center justify-center cursor-pointer">
                <input
                    type="checkbox"
                    ref={ref}
                    checked={checked}
                    onChange={handleChange}
                    className="sr-only peer"
                    {...props}
                />
                <div className={cn(
                    "h-4 w-4 rounded border border-navy-DEFAULT/40 bg-white",
                    "peer-checked:bg-green-600 peer-checked:border-green-600",
                    "peer-focus:ring-2 peer-focus:ring-gold-classic peer-focus:ring-offset-1",
                    "transition-all duration-200",
                    "relative flex items-center justify-center",
                    className
                )}>
                    {checked && (
                        <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </div>
            </label>
        );
    }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
