import React from 'react';
import { cn } from '@/lib/utils';
import "../styles/index.css";

interface LegendItemProps {
  color: string;
  label: string;
  bordered?: boolean;
}

export default function LegendItem({ color, label, bordered } : LegendItemProps) {
  return (
    <div
      className={cn(
        "legend-item-wrapper px-3 py-1.5 rounded-full shrink-0",
        bordered
          ? "border border-slate-300 bg-slate-50"
          : "bg-white border border-stone-100"
      )}
    >
      <div className={cn("legend-item-color", color)} />
      <span
        className={cn(
          "text-xs font-bold uppercase tracking-widest",
          bordered ? "text-slate-900" : "text-stone-500"
        )}
      >
        {label}
      </span>
    </div>
  );
};
