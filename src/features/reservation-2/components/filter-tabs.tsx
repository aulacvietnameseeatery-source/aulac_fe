import React from 'react';
import { cn } from '@/lib/utils';
// We assume access to standard UI components or Tailwind classes.
// Using a horizontal scroll container for responsiveness.

interface FilterTabsProps {
    label?: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export default function FilterTabs({
    label,
    options,
    value,
    onChange,
    className
}: FilterTabsProps) {
    return (
        <div className={cn("flex flex-col gap-2", className)}>
            {label && (
                <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                    {label}
                </span>
            )}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
                {options.map((option) => (
                    <button
                        key={option}
                        onClick={() => onChange(option)}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors border",
                            value === option
                                ? "bg-[#1A3A52] text-white border-[#1A3A52]"
                                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        )}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );
}
