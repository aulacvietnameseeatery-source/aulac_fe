import React from "react";
import { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: string | number | null | undefined;
  icon?: LucideIcon;
};

export const MetaRow = ({ label, value, icon: Icon }: Props) => {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 px-2 rounded transition-colors">
      <span className="text-sm text-gray-500 font-medium flex items-center gap-2">
        {Icon && <Icon size={14} className="text-gray-400" />}
        {label}
      </span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
};