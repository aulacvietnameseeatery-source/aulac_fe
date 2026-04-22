// src/features/auth/role-edit/components/RoleFormInputs.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

type Props = {
  roleName: string;
  errors: {
    roleName?: string;
  };
  isSubmitting: boolean;
  onRoleNameChange: (value: string) => void;
};

export const RoleFormInputs = ({
  roleName,
  errors,
  isSubmitting,
  onRoleNameChange
}: Props) => {
  const t = useTranslations('Role.Edit');

  return (
    <div className="mb-8 px-8">
      {/* Role Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          {t('roleName')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={roleName}
          onChange={(e) => onRoleNameChange(e.target.value)}
          placeholder={t('roleNamePlaceholder')}
          maxLength={50}
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
  );
};
