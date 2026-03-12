"use client";

import React from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DishCategory } from "../types";

interface CategoryActionsProps {
  category: DishCategory;
  onEdit: (category: DishCategory) => void;
}

export const CategoryActions = ({ 
  category, 
  onEdit, 
}: CategoryActionsProps) => {
  return (
    <div className="flex items-center justify-end gap-2">
      {/* Edit Button */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => onEdit(category)}
        title="Edit"
      >
        <Pencil className="w-4 h-4 text-gray-600" />
      </Button>
    </div>
  );
};
