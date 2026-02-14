"use client";

import React from "react";
import { Edit } from "lucide-react";
import { DishCategory } from "../types";

interface CategoryActionsProps {
  category: DishCategory;
  onEdit: (category: DishCategory) => void;
  onToggleStatus: (category: DishCategory) => void;
}

export const CategoryActions = ({ 
  category, 
  onEdit, 
  onToggleStatus 
}: CategoryActionsProps) => {
  // Helper to prevent click events from spreading to rows.
  const handleAction = (
    e: React.MouseEvent, 
    action: (item: DishCategory) => void
  ) => {
    e.stopPropagation();
    action(category);
  };

  return (
    <div className="flex justify-end items-center gap-3">
      {/* Toggle Status Button */}
      <button
        onClick={(e) => handleAction(e, onToggleStatus)}
        className="relative inline-block w-9 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0"
        style={{ backgroundColor: !category.isDisabled ? '#1f2937' : '#e5e7eb' }}
        title={!category.isDisabled ? 'Active - Click to disable' : 'Inactive - Click to enable'}
      >
        <span
          className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
          style={{
            transform: !category.isDisabled ? 'translateX(16px)' : 'translateX(0)',
            border: !category.isDisabled ? '1px solid white' : '1px solid #d1d5db'
          }}
        />
      </button>
      
      {/* Edit Button */}
      <button 
        onClick={(e) => handleAction(e, onEdit)}
        className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer p-1"
        title="Edit Category"
      >
        <Edit size={18} />
      </button>
    </div>
  );
};
