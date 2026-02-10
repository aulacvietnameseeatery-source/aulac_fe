import React from 'react';
import { ChevronDown } from 'lucide-react';
import { StatusFilter as StatusFilterType } from '../types';

interface StatusFilterProps {
  value: StatusFilterType;
  onChange: (value: StatusFilterType) => void;
}

export default function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as StatusFilterType)}
        className="w-40 h-10 pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg text-sm font-medium font-['Inter'] text-slate-700 outline-none cursor-pointer appearance-none transition-colors"
      >
        <option value="all">All Statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}
