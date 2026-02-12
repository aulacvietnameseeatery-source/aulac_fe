// src/features/auth/role-create/components/EditablePermissionsSection.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { PermissionGroupDto } from '../types/role-create.types';
import { EditablePermissionGroup } from './EditablePermissionGroup';

type Props = {
  permissionGroups: PermissionGroupDto[];
  allPermissionsSelected: boolean;
  totalSelected: number;
  totalPermissions: number;
  isLoadingPermissions?: boolean;
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
  isLoadingPermissions = false,
  isSubmitting,
  onToggleAll,
  onToggleGroup,
  onTogglePermission
}: Props) => {
  const t = useTranslations('Role.Create');

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
            disabled={isLoadingPermissions || isSubmitting}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
          />
          <span className="text-sm font-medium text-gray-700">
            {t('all')} ({totalSelected}/{totalPermissions})
          </span>
        </div>
      </div>

      {/* Permission Groups Grid */}
      <div className="border border-gray-200 rounded-lg p-6">
        {isLoadingPermissions ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            <span className="ml-3 text-gray-500">{t('loadingPermissions')}</span>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};
