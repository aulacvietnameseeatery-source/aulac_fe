"use client";

import React from "react";

import { Supplier } from "../types";

interface SupplierActionsProps {
  supplier: Supplier;
  onView: (supplier: Supplier) => void;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

import { TableActionColumn, TableAction } from "@/components/ui/table/table-action-column";

export const SupplierActions = ({ 
  supplier, 
  onView,
  onEdit,
  onDelete, 
}: SupplierActionsProps) => {
  const actions: TableAction<Supplier>[] = [
    { action: "view", onClick: onView },
    { action: "edit", onClick: onEdit },
    { action: "delete", onClick: onDelete }
  ];
  return <TableActionColumn actions={actions} item={supplier} />;
};
