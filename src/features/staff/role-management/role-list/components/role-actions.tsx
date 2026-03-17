"use client";

import React from "react";

import { RoleDto } from "../types/role.types";
import { Permissions } from '@/types/const';

interface RoleActionsProps {
  role: RoleDto;
  onView: (role: RoleDto) => void;
  onEdit: (role: RoleDto) => void;
  onDelete: (role: RoleDto) => void;
}

import { TableActionColumn, TableAction } from "@/components/ui/table/table-action-column";

export const RoleActions = ({ 
  role, 
  onView, 
  onEdit, 
  onDelete 
}: RoleActionsProps) => {

    const actions: TableAction<RoleDto>[] = [
      {
        action: "view",
        onClick: onView,
        permission: Permissions.ViewRole
      },
      {
        action: "edit",
        onClick: onEdit,
        permission: Permissions.UpdateRole
      },
      {
        action: "delete",
        onClick: onDelete,
        permission: Permissions.DeleteRole
      }
    ];

    return <TableActionColumn actions={actions} item={role} />;
};