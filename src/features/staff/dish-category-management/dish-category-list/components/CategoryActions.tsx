"use client";

import React from "react";

import { DishCategory } from "../types";

interface CategoryActionsProps {
  category: DishCategory;
  onEdit: (category: DishCategory) => void;
}

import { TableActionColumn, TableAction } from "@/components/ui/table/table-action-column";

export const CategoryActions = ({ 
  category, 
  onEdit, 
}: CategoryActionsProps) => {
  const actions: TableAction<DishCategory>[] = [
    {
      action: "edit",
      onClick: onEdit,
    }
  ];

  return <TableActionColumn actions={actions} item={category} />;
};
