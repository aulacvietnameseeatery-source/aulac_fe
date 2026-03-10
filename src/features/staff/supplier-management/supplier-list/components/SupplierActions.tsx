"use client";

import React from "react";
import { Edit, Trash2, Eye } from "lucide-react";
import { Supplier } from "../types";

interface SupplierActionsProps {
  supplier: Supplier;
  onView: (supplier: Supplier) => void;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

export const SupplierActions = ({ 
  supplier, 
  onView,
  onEdit,
  onDelete, 
}: SupplierActionsProps) => {
  // Helper to prevent click events from spreading to rows.
  const handleAction = (
    e: React.MouseEvent, 
    action: (item: Supplier) => void
  ) => {
    e.stopPropagation();
    action(supplier);
  };

  return (
    <div className="flex justify-end items-center gap-3">
      {/* View Button */}
      <button 
        onClick={(e) => handleAction(e, onView)}
        className="text-gray-400 hover:text-green-600 transition-colors cursor-pointer p-1"
        title="View Details"
      >
        <Eye size={18} />
      </button>

      {/* Edit Button */}
      <button 
        onClick={(e) => handleAction(e, onEdit)}
        className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer p-1"
        title="Edit Supplier"
      >
        <Edit size={18} />
      </button>

      {/* Delete Button */}
      <button 
        onClick={(e) => handleAction(e, onDelete)}
        className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer p-1"
        title="Delete Supplier"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};
