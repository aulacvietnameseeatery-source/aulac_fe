// src/features/auth/role-create/components/EditablePermissionGroup.tsx
'use client';

import React from 'react';
import { PermissionGroupDto } from '../types/role-create.types';

type Props = {
  group: PermissionGroupDto;
  isSubmitting: boolean;
  onToggleGroup: (group: PermissionGroupDto) => void;
  onTogglePermission: (permissionId: number) => void;
};

export const EditablePermissionGroup = ({
  group,
  isSubmitting,
  onToggleGroup,
  onTogglePermission
}: Props) => {
  const allGroupSelected = group.permissions.every(p => p.isAssigned);

  return (
    <div>
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
};
