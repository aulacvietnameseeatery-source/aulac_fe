import React from 'react';
import { cn } from '@/lib/utils';

interface LegendItemProps {
  color: string;
  label: string;
  bordered?: boolean;
}

export default function LegendItem({ color, label, bordered } : LegendItemProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full shrink-0',
        bordered
          ? 'border border-[#1A3A52]/20 bg-[#1A3A52]/5'
          : 'bg-white border border-stone-100'
      )}
    >
      <div className={cn('w-2 h-2 rounded-full', color)} />
      <span
        className={cn(
          'text-[10px] font-bold uppercase tracking-wider',
          bordered ? 'text-[#132538]' : 'text-stone-500'
        )}
      >
        {label}
      </span>
    </div>
  );
};
