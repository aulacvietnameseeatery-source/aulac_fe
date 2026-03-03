// src/features/auth/role-detail/components/RoleStatusToggle.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

type Props = {
  isActive: boolean;
};

export const RoleStatusToggle = ({ isActive }: Props) => {
  const t = useTranslations('Role.Detail');

  return (
    <div className="mb-8 px-8">
      <label className="block text-sm font-semibold text-gray-900 mb-2">
        {t('status')}
      </label>
      <div className="flex items-center h-[50px]">
        <div className="relative inline-block">
          <input
            type="checkbox"
            checked={isActive}
            readOnly
            disabled
            className="sr-only peer"
          />
          <div className={`w-14 h-7 rounded-full transition-colors cursor-not-allowed ${
            isActive ? 'bg-green-500' : 'bg-gray-300'
          }`}>
            <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
              isActive ? 'translate-x-7' : 'translate-x-0'
            }`} />
          </div>
        </div>
        <span className={`ml-3 text-sm font-medium ${
          isActive ? 'text-green-600' : 'text-gray-500'
        }`}>
          {isActive ? t('active') : t('inactive')}
        </span>
      </div>
    </div>
  );
};
