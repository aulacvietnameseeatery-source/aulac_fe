// src/features/auth/role-detail/components/RoleBasicInfo.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

type Props = {
  roleCode: string;
  roleName: string;
};

export const RoleBasicInfo = ({ roleCode, roleName }: Props) => {
  const t = useTranslations('Role.Detail');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 px-8">
      {/* Role Code */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          {t('roleCode')}
        </label>
        <input
          type="text"
          value={roleCode}
          readOnly
          className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 font-medium focus:outline-none cursor-not-allowed"
        />
      </div>

      {/* Role Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          {t('roleName')}
        </label>
        <input
          type="text"
          value={roleName}
          readOnly
          className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 font-medium focus:outline-none cursor-not-allowed"
        />
      </div>
    </div>
  );
};
