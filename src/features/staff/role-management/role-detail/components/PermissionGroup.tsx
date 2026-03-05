// src/features/auth/role-detail/components/PermissionGroup.tsx
'use client';

import React from 'react';
import { PermissionGroupDto } from '../types/role-detail.types';

type Props = {
  group: PermissionGroupDto;
};

export const PermissionGroup = ({ group }: Props) => {
  const allPermissionsAssigned = group.permissions.every(p => p.isAssigned);

  return (
    <div>
      <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
        <input
          type="checkbox"
          checked={allPermissionsAssigned}
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
  );
};
