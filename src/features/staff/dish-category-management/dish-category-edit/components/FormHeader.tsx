import React from 'react';

interface FormHeaderProps {
  title: string;
  subtitle: string;
  onCancel: () => void;
  onSave: () => void;
  isLoading: boolean;
  saveButtonText: string;
}

export default function FormHeader({
  title,
  subtitle,
  onCancel,
  onSave,
  isLoading,
  saveButtonText,
}: FormHeaderProps) {
  return (
    <div className="mb-5">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-slate-900 text-[32px] font-bold font-['Inter'] leading-tight mb-1.5">
            {title}
          </h1>
          <p className="text-slate-600 text-[15px] font-['Inter']">
            {subtitle}
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-7 py-3 rounded-lg border border-slate-300 bg-white text-slate-700 text-[15px] font-semibold font-['Inter'] hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back To List
          </button>
          <button
            onClick={onSave}
            disabled={isLoading}
            className="px-7 py-3 bg-[#1e293b] rounded-lg text-white text-[15px] font-semibold font-['Inter'] hover:bg-[#334155] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : saveButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}
