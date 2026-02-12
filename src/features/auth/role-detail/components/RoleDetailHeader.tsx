// src/features/auth/role-detail/components/RoleDetailHeader.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

type Props = {
  onBack: () => void;
  onEdit: () => void;
};

export const RoleDetailHeader = ({ onBack, onEdit }: Props) => {
  const t = useTranslations('Role.Detail');

  return (
    <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100 px-8 pt-4">
      <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
      
      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          type="button"
          className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {t('back')}
        </button>
        <button
          onClick={onEdit}
          type="button"
          className="px-6 py-3 bg-[#1e3a2f] text-white rounded-lg text-sm font-semibold hover:bg-[#2d5547] transition-colors"
        >
          {t('edit')}
        </button>
      </div>
    </div>
  );
};
