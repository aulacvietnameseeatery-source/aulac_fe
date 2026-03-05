"use client";

import React from "react";
import { Edit } from "lucide-react";
import { DishCategory } from "../types";

interface CategoryActionsProps {
  category: DishCategory;
  onEdit: (category: DishCategory) => void;
}

export const CategoryActions = ({ 
  category, 
  onEdit, 
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
