// src/features/auth/role-detail/components/PermissionGroup.tsx
'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { PermissionGroupDto } from '../types/role-detail.types';

type Props = {
  group: PermissionGroupDto;
};

export const PermissionGroup = ({ group }: Props) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const allPermissionsAssigned = group.permissions.every(p => p.isAssigned);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <input
            type="checkbox"
            checked={allPermissionsAssigned}
            readOnly
            disabled
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-not-allowed"
          />
          {group.displayName}
        </h3>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
      {isExpanded && (
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
      )}
    </div>
  );
};
