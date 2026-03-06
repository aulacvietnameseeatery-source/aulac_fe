// src/features/auth/role-detail/components/PermissionsSection.tsx
'use client';

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { PermissionGroupDto } from '../types/role-detail.types';
import { PermissionGroup } from './PermissionGroup';

type Props = {
  permissionGroups: PermissionGroupDto[];
};

export const PermissionsSection = ({ permissionGroups }: Props) => {
  const t = useTranslations('Role.Detail');

  // Calculate if all permissions are assigned
  const allPermissionsAssigned = useMemo(() => {
    return permissionGroups.every(group => 
      group.permissions.every(p => p.isAssigned)
    );
  }, [permissionGroups]);

  // Count total assigned permissions
  const totalAssigned = useMemo(() => {
    return permissionGroups.reduce((acc, group) => 
      acc + group.permissions.filter(p => p.isAssigned).length, 0
    );
  }, [permissionGroups]);

  const totalPermissions = useMemo(() => {
    return permissionGroups.reduce((acc, group) => 
      acc + group.permissions.length, 0
    );
  }, [permissionGroups]);

  return (
    <div className="mb-8 px-8 pb-8">
      <div className="flex items-center justify-between mb-4">
        <label className="text-sm font-semibold text-gray-900">
          {t('permissions')}
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
            {t('all')} ({totalAssigned}/{totalPermissions})
          </span>
        </div>
      </div>

      {/* Permission Groups Grid */}
      <div className="border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {permissionGroups.map((group) => (
            <PermissionGroup key={group.screenCode} group={group} />
          ))}
        </div>
      </div>
    </div>
  );
};
