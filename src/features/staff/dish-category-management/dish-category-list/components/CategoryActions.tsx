"use client";

import React from "react";
import { DishCategory } from "../types";
import { TableActionColumn, TableAction } from "@/components/ui/table/table-action-column";
import { Permissions } from "@/types/const";

interface CategoryActionsProps {
  category: DishCategory;
  onEdit: (category: DishCategory) => void;
}

export const CategoryActions = ({ 
  category, 
  onEdit, 
}: CategoryActionsProps) => {
  const actions: TableAction<DishCategory>[] = [
    {
      action: "edit",
      onClick: onEdit,
      permission: Permissions.EditDishCategory,
    }
  ];

  return <TableActionColumn actions={actions} item={category} />;
};
