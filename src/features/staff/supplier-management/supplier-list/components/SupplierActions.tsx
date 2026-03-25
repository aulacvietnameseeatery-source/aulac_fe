"use client";

import React from "react";
import { Supplier } from "../types";
import { TableActionColumn, TableAction } from "@/components/ui/table/table-action-column";
import { Permissions } from "@/types/const";

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
  const actions: TableAction<Supplier>[] = [
    { action: "view", onClick: onView },
    { action: "edit", onClick: onEdit, permission: Permissions.EditSupplier },
    { action: "delete", onClick: onDelete, permission: Permissions.DeleteSupplier }
  ];
  return <TableActionColumn actions={actions} item={supplier} />;
};
