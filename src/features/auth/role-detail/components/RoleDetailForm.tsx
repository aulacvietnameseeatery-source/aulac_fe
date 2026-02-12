// src/features/auth/role-detail/components/RoleDetailForm.tsx
'use client';

import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import { RoleDetailDto, PermissionGroupDto } from "../types/role-detail.types";

type Props = {
  roleDetail: RoleDetailDto;
  onBack: () => void;
  onEdit: () => void;
};

export const RoleDetailForm = ({ roleDetail, onBack, onEdit }: Props) => {
  const t = useTranslations("Role.Detail");

  // Calculate if all permissions are assigned
  const allPermissionsAssigned = useMemo(() => {
    return roleDetail.permissionGroups.every(group => 
      group.permissions.every(p => p.isAssigned)
    );
  }, [roleDetail.permissionGroups]);

  // Count total assigned permissions
  const totalAssigned = useMemo(() => {
    return roleDetail.permissionGroups.reduce((acc, group) => 
      acc + group.permissions.filter(p => p.isAssigned).length, 0
    );
  }, [roleDetail.permissionGroups]);

  const totalPermissions = useMemo(() => {
    return roleDetail.permissionGroups.reduce((acc, group) => 
      acc + group.permissions.length, 0
    );
  }, [roleDetail.permissionGroups]);

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100 px-8 pt-4">
        <h2 className="text-2xl font-bold text-gray-900">{t("title")}</h2>
        
        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onBack}
            type="button"
            className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {t("back")}
          </button>
          <button
            onClick={onEdit}
            type="button"
            className="px-6 py-3 bg-[#1e3a2f] text-white rounded-lg text-sm font-semibold hover:bg-[#2d5547] transition-colors"
          >
            {t("edit")}
          </button>
        </div>
      </div>

      {/* Role Code & Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 px-8">
        {/* Role Code */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            {t("roleCode")}
          </label>
          <input
            type="text"
            value={roleDetail.roleCode}
            readOnly
            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 font-medium focus:outline-none cursor-not-allowed"
          />
        </div>

        {/* Role Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            {t("roleName")}
          </label>
          <input
            type="text"
            value={roleDetail.roleName}
            readOnly
            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 font-medium focus:outline-none cursor-not-allowed"
          />
        </div>
      </div>

      {/* Status */}
      <div className="mb-8 px-8">
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          {t("status")}
        </label>
        <div className="flex items-center h-[50px]">
          <div className="relative inline-block">
            <input
              type="checkbox"
              checked={roleDetail.isActive}
              readOnly
              disabled
              className="sr-only peer"
            />
            <div className={`w-14 h-7 rounded-full transition-colors cursor-not-allowed ${
              roleDetail.isActive ? 'bg-green-500' : 'bg-gray-300'
            }`}>
              <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                roleDetail.isActive ? 'translate-x-7' : 'translate-x-0'
              }`} />
            </div>
          </div>
          <span className={`ml-3 text-sm font-medium ${
            roleDetail.isActive ? 'text-green-600' : 'text-gray-500'
          }`}>
            {roleDetail.isActive ? t("active") : t("inactive")}
          </span>
        </div>
      </div>

      {/* Permissions Section */}
      <div className="mb-8 px-8 pb-8">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-semibold text-gray-900">
            {t("permissions")}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={allPermissionsAssigned}
              readOnly
              disabled
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-not-allowed"
            />
            <span className="text-sm font-medium text-gray-700">
              {t("all")} ({totalAssigned}/{totalPermissions})
            </span>
          </div>
        </div>

        {/* Permission Groups Grid */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {roleDetail.permissionGroups.map((group: PermissionGroupDto) => (
              <div key={group.screenCode}>
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={group.permissions.every(p => p.isAssigned)}
                    readOnly
                    disabled
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-not-allowed"
                  />
                  {group.displayName}
                </h3>
                <div className="space-y-2 ml-6">
                  {group.permissions.map((permission) => (
                    <label key={permission.permissionId} className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={permission.isAssigned}
                        readOnly
                        disabled
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-not-allowed"
                      />
                      {permission.displayName}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
