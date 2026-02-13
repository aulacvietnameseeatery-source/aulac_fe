import React from 'react';
import { Plus } from 'lucide-react';

interface ListHeaderProps {
  onAddCategory: () => void;
}

export default function ListHeader({ onAddCategory }: ListHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-slate-900 text-2xl font-bold font-['Inter'] leading-8 mb-1">
            Dish Category List
          </h1>
          <p className="text-slate-600 text-sm font-normal font-['Inter']">
            Manage and organize your restaurant menu categories efficiently.
          </p>
        </div>
        <button
          onClick={onAddCategory}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg shadow-sm flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4 text-white" />
          <span className="text-white text-sm font-medium font-['Inter']">
            Add New Category
          </span>
        </button>
      </div>
    </div>
  );
}
