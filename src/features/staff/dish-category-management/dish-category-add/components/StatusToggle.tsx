import React from 'react';

interface StatusToggleProps {
  isActive: boolean;
  onToggle: () => void;
}

export default function StatusToggle({ isActive, onToggle }: StatusToggleProps) {
  return (
    <div className="pt-8 border-t border border-[#D5BA98]/60">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <label className="block text-[#1e293b] text-[13px] font-extrabold font-['Inter'] uppercase tracking-[0.5px] mb-3">
            Category Status
          </label>
          <p className="text-slate-600 text-[15px] font-['Inter']">
            {isActive 
              ? 'This category is active and visible in the menu'
              : 'This category is inactive and hidden from customers'}
          </p>
        </div>
        <button
          onClick={onToggle}
          className="relative inline-block w-[50px] h-[26px] rounded-full transition-all cursor-pointer flex-shrink-0 shadow-sm ml-6"
          style={{ backgroundColor: isActive ? '#10b981' : '#cbd5e1' }}
        >
          <span
            className="absolute top-[3px] left-[3px] w-5 h-5 bg-white rounded-full shadow-md transition-all duration-200"
            style={{
              transform: isActive ? 'translateX(24px)' : 'translateX(0)',
            }}
          />
        </button>
      </div>
    </div>
  );
}
