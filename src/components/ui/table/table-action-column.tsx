import React, { useMemo } from 'react';
import { Eye, Edit, Trash2, X, Power, PackagePlus, History } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PermissionGuard } from "@/components/permission-guard";
import { MoreHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";

export type BuiltInActionType = "view" | "edit" | "delete" | "cancel" | "deactivate" | "adjust-stock" | "history";

export interface TableAction<T = any> {
  action: BuiltInActionType;
  onClick: (item: T) => void;
  disabled?: boolean;
  permission?: string;
  show?: boolean | ((item: T) => boolean);
}

interface TableActionColumnProps<T> {
  actions: TableAction<T>[];
  item: T;
}

const ACTION_ICONS: Record<BuiltInActionType, { icon: React.ReactNode; colorClass: string }> = {
  view: { icon: <Eye size={18} />, colorClass: "text-gray-400 hover:text-blue-600" },
  edit: { icon: <Edit size={18} />, colorClass: "text-gray-400 hover:text-blue-600" },
  delete: { icon: <Trash2 size={18} />, colorClass: "text-red-500 hover:text-red-600" },
  cancel: { icon: <X size={18} />, colorClass: "text-red-500 hover:text-red-600" },
  deactivate: { icon: <Power size={18} />, colorClass: "text-red-500 hover:text-red-600" },
  "adjust-stock": { icon: <PackagePlus size={18} />, colorClass: "text-green-600 hover:text-green-700" },
  history: { icon: <History size={18} />, colorClass: "text-blue-600 hover:text-blue-700" },
};

export function TableActionColumn<T>({ actions, item }: TableActionColumnProps<T>) {
  const t = useTranslations("common.table.actions");

  const visibleActions = useMemo(() => {
    return actions.filter(action => {
      if (typeof action.show === 'function') return action.show(item);
      if (action.show !== undefined) return action.show;
      return true;
    });
  }, [actions, item]);

  if (visibleActions.length === 0) return null;

  const renderButton = (actionDef: TableAction<T>, key: number) => {
    const iconDef = ACTION_ICONS[actionDef.action];
    const label = t(actionDef.action as any);

    // Fallback if an unknown action passes through somehow
    if (!iconDef) return null;

    const button = (
      <button
        key={key}
        className={`transition-colors cursor-pointer p-1. rounded-md ${iconDef.colorClass}`}
        data-tooltip-content={label}
        data-tooltip-id="my-tooltip"
        disabled={actionDef.disabled}
        onClick={(e) => {
          e.stopPropagation();
          actionDef.onClick(item);
        }}
        title={label}
      >
        {iconDef.icon}
      </button>
    );

    if (actionDef.permission) {
      return <PermissionGuard key={`perm-${key}`} permission={actionDef.permission}>{button}</PermissionGuard>;
    }
    return button;
  };

  // Prioritize "edit" action, then "view", then first available
  let primaryIndex = visibleActions.findIndex(a => a.action === 'edit');
  if (primaryIndex === -1) {
    primaryIndex = visibleActions.findIndex(a => a.action === 'view');
  }
  if (primaryIndex === -1) {
    primaryIndex = 0;
  }

  if (visibleActions.length <= 2) {
    // If <= 2 actions, ensure primary comes first visually
    const sortedForDisplay = [...visibleActions];
    if (primaryIndex > 0) {
      const primary = sortedForDisplay.splice(primaryIndex, 1)[0];
      sortedForDisplay.unshift(primary);
    }

    return (
      <div className="flex items-center justify-end gap-1">
        {sortedForDisplay.map((action, index) => renderButton(action, index))}
      </div>
    );
  }

  const primaryAction = visibleActions[primaryIndex];
  const dropdownActions = visibleActions.filter((_, idx) => idx !== primaryIndex);

  return (
    <div className="flex items-center justify-end gap-1">
      {renderButton(primaryAction, 0)}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer p-1.5 rounded-md focus:outline-none"
            onClick={(e) => e.stopPropagation()}
            title="More actions"
          >
            <MoreHorizontal size={18} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 z-50 bg-white shadow-md border rounded-md">
          {dropdownActions.map((actionDef, index) => {
            const iconDef = ACTION_ICONS[actionDef.action];
            const label = t(actionDef.action as any);
            if (!iconDef) return null;

            const menuItem = (
              <DropdownMenuItem
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  actionDef.onClick(item);
                }}
                disabled={actionDef.disabled}
                className={`cursor-pointer px-3 py-2 text-sm flex items-center gap-2 transition-colors ${iconDef.colorClass}`}
              >
                <div className="flex items-center gap-2">
                  {iconDef.icon}
                  <span>{label}</span>
                </div>
              </DropdownMenuItem>
            );

            if (actionDef.permission) {
              return (
                <PermissionGuard key={`perm-dropdown-${index}`} permission={actionDef.permission}>
                  {menuItem}
                </PermissionGuard>
              );
            }
            return menuItem;
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
