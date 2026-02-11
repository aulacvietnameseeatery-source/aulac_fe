"use client";

import React from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
import { RoleDto } from "../types/role.types";
import { useTranslations } from "next-intl";
import { PermissionGuard } from '@/components/permission-guard';
import { Permissions } from '@/types/const';

interface RoleActionsProps {
  role: RoleDto;
  onView: (role: RoleDto) => void;
  onEdit: (role: RoleDto) => void;
  onDelete: (role: RoleDto) => void;
}

export const RoleActions = ({ 
  role, 
  onView, 
  onEdit, 
  onDelete 
}: RoleActionsProps) => {
    const t = useTranslations("Role.List");
  
  // Helper to prevent click events from spreading to rows.
  const handleAction = (
    e: React.MouseEvent, 
    action: (item: RoleDto) => void
  ) => {
    e.stopPropagation();
    action(role);
  };

  return (
    <div className="flex justify-end items-center gap-3">
      <PermissionGuard permission={Permissions.ViewRole}>
        <button 
          className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer p-1"
          title={t("actions.view")}
          onClick={(e) => handleAction(e, onView)}
        >
          <Eye size={18} />
        </button>
      </PermissionGuard>

      <PermissionGuard permission={Permissions.UpdateRole}>
        <button 
          className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer p-1"
          title={t("actions.edit")}
          onClick={(e) => handleAction(e, onEdit)}
        >
          <Edit size={18} />
        </button>
      </PermissionGuard>

      <PermissionGuard permission={Permissions.DeleteRole}>
        <button 
          className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer p-1"
          title={t("actions.delete")}
          onClick={(e) => handleAction(e, onDelete)}
        >
          <Trash2 size={18} />
        </button>
      </PermissionGuard>
    </div>
  );
};