// src/features/auth/role-edit/components/RoleEditForm.tsx
'use client';

import React from "react";
import { useTranslations } from "next-intl";
import { PermissionGroupDto } from "../types/role-edit.types";
import { Loader2 } from "lucide-react";

type Props = {
  roleCode: string;
  roleName: string;
  isActive: boolean;
  permissionGroups: PermissionGroupDto[];
  allPermissionsSelected: boolean;
  isSubmitting: boolean;
  errors: {
    roleCode?: string;
    roleName?: string;
  };
  totalSelected: number;
  totalPermissions: number;
  onRoleCodeChange: (value: string) => void;
  onRoleNameChange: (value: string) => void;
  onIsActiveChange: (value: boolean) => void;
  onTogglePermission: (permissionId: number) => void;
  onToggleGroup: (group: PermissionGroupDto) => void;
  onToggleAll: () => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export const RoleEditForm = ({
  roleCode,
  roleName,
  isActive,
  permissionGroups,
  allPermissionsSelected,
  isSubmitting,
  errors,
  totalSelected,
  totalPermissions,
  onRoleCodeChange,
  onRoleNameChange,
  onIsActiveChange,
  onTogglePermission,
  onToggleGroup,
  onToggleAll,
  onSubmit,
  onCancel
}: Props) => {
  const t = useTranslations("Role.Edit");

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900">{t("title")}</h2>
      </div>

      {/* Role Code & Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Role Code */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            {t("roleCode")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={roleCode}
            onChange={(e) => onRoleCodeChange(e.target.value)}
            placeholder={t("roleCodePlaceholder")}
            maxLength={50}
            className={`w-full px-4 py-3 border rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-2 ${
              errors.roleCode 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-200 focus:ring-blue-500'
            }`}
            disabled={isSubmitting}
          />
          {errors.roleCode && (
            <p className="mt-1 text-sm text-red-600">{errors.roleCode}</p>
          )}
        </div>

        {/* Role Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            {t("roleName")} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={roleName}
            onChange={(e) => onRoleNameChange(e.target.value)}
            placeholder={t("roleNamePlaceholder")}
            maxLength={100}
            className={`w-full px-4 py-3 border rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-2 ${
              errors.roleName 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-200 focus:ring-blue-500'
            }`}
            disabled={isSubmitting}
          />
          {errors.roleName && (
            <p className="mt-1 text-sm text-red-600">{errors.roleName}</p>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          {t("status")}
        </label>
        <div className="flex items-center h-[50px]">
          <button
            type="button"
            onClick={() => onIsActiveChange(!isActive)}
            disabled={isSubmitting}
            className="relative inline-block"
          >
            <input
              type="checkbox"
              checked={isActive}
              readOnly
              className="sr-only peer"
            />
            <div className={`w-14 h-7 rounded-full transition-colors ${
              isActive ? 'bg-green-500' : 'bg-gray-300'
            } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
              <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                isActive ? 'translate-x-7' : 'translate-x-0'
              }`} />
            </div>
          </button>
          <span className={`ml-3 text-sm font-medium ${
            isActive ? 'text-green-600' : 'text-gray-500'
          }`}>
            {isActive ? t("active") : t("inactive")}
          </span>
        </div>
      </div>

      {/* Permissions Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-semibold text-gray-900">
            {t("permissions")}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={allPermissionsSelected}
              onChange={onToggleAll}
              disabled={isSubmitting}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
            />
            <span className="text-sm font-medium text-gray-700">
              {t("all")} ({totalSelected}/{totalPermissions})
            </span>
          </div>
        </div>

        {/* Permission Groups Grid */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {permissionGroups.map((group: PermissionGroupDto) => {
              const allGroupSelected = group.permissions.every(p => p.isAssigned);
              
              return (
                <div key={group.screenCode}>
                  <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={allGroupSelected}
                      onChange={() => onToggleGroup(group)}
                      disabled={isSubmitting}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                    />
                    {group.displayName}
                  </h3>
                  <div className="space-y-2 ml-6">
                    {group.permissions.map((permission) => (
                      <label 
                        key={permission.permissionId} 
                        className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={permission.isAssigned}
                          onChange={() => onTogglePermission(permission.permissionId)}
                          disabled={isSubmitting}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                        />
                        {permission.displayName}
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <button
          onClick={onCancel}
          type="button"
          disabled={isSubmitting}
          className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("cancel")}
        </button>
        <button
          onClick={onSubmit}
          type="button"
          disabled={isSubmitting}
          className="px-6 py-3 bg-[#1e3a2f] text-white rounded-lg text-sm font-semibold hover:bg-[#2d5547] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {t("save")}
        </button>
      </div>
    </div>
  );
};
