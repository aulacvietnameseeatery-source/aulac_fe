
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { PermissionGroupDto } from '../types/role-edit.types';
import { EditablePermissionGroup } from './EditablePermissionGroup';

type Props = {
  permissionGroups: PermissionGroupDto[];
  allPermissionsSelected: boolean;
  totalSelected: number;
  totalPermissions: number;
  isSubmitting: boolean;
  onToggleAll: () => void;
  onToggleGroup: (group: PermissionGroupDto) => void;
  onTogglePermission: (permissionId: number) => void;
};

export const EditablePermissionsSection = ({
  permissionGroups,
  allPermissionsSelected,
  totalSelected,
  totalPermissions,
  isSubmitting,
  onToggleAll,
  onToggleGroup,
  onTogglePermission
}: Props) => {
  const t = useTranslations('Role.Edit');

  return (
    <div className="mb-8 px-8 pb-8">
      <div className="flex items-center justify-between mb-4">
        <label className="text-sm font-semibold text-gray-900">
          {t('permissions')}
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
            {t('all')} ({totalSelected}/{totalPermissions})
          </span>
        </div>
      </div>

      {/* Permission Groups Grid */}
      <div className="border border-gray-200 rounded-lg p-6 max-h-[calc(100vh-350px)] overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {permissionGroups.map((group) => (
            <EditablePermissionGroup
              key={group.screenCode}
              group={group}
              isSubmitting={isSubmitting}
              onToggleGroup={onToggleGroup}
              onTogglePermission={onTogglePermission}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
