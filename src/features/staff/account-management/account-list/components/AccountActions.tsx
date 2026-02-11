"use client";

import React from "react";
import { Eye, Edit, RotateCcw } from "lucide-react";
import { StaffAccount } from "../types/staff-account.types";
import { useTranslations } from "next-intl";
import { PermissionGuard } from '@/components/permission-guard';
import { Permissions } from '@/types/const';

interface AccountActionsProps {
  account: StaffAccount;
  onView: (account: StaffAccount) => void;
  onEdit: (account: StaffAccount) => void;
  onResetPassword: (account: StaffAccount) => void;
}

export const AccountActions = ({ 
  account, 
  onView, 
  onEdit, 
  onResetPassword 
}: AccountActionsProps) => {
  const t = useTranslations("Account.List");
  
  // Helper to prevent click events from spreading to rows.
  const handleAction = (
    e: React.MouseEvent, 
    action: (item: StaffAccount) => void
  ) => {
    e.stopPropagation();
    action(account);
  };

  return (
    <div className="flex justify-end items-center gap-3">
      <PermissionGuard permission={Permissions.ViewAccount}>
        <button 
          className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer p-1"
          title={t("actions.view")}
          onClick={(e) => handleAction(e, onView)}
        >
          <Eye size={18} />
        </button>
      </PermissionGuard>

      <PermissionGuard permission={Permissions.UpdateAccount}>
        <button 
          className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer p-1"
          title={t("actions.edit")}
          onClick={(e) => handleAction(e, onEdit)}
        >
          <Edit size={18} />
        </button>
      </PermissionGuard>

      <PermissionGuard permission={Permissions.UpdateAccount}>
        <button 
          className="text-gray-400 hover:text-orange-500 transition-colors cursor-pointer p-1"
          title={t("actions.resetPassword")}
          onClick={(e) => handleAction(e, onResetPassword)}
        >
          <RotateCcw size={18} />
        </button>
      </PermissionGuard>
    </div>
  );
};
