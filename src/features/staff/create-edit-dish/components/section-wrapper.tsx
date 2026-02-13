import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode; 
}

export const SectionWrapper = ({ title, subtitle, children, className, action }: SectionWrapperProps) => {
  return (
    <div className={cn("bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col", className)}>
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};