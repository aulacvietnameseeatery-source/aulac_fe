// src/features/auth/role-create/components/RoleCreateHeader.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';

type Props = {
  isSubmitting: boolean;
  isLoadingPermissions?: boolean;
  onCancel: () => void;
  onSubmit: () => void;
};

export const RoleCreateHeader = ({ isSubmitting, isLoadingPermissions, onCancel, onSubmit }: Props) => {
  const t = useTranslations('Role.Create');

  return (
    <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100 px-8 pt-4">
      <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
      
      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onCancel}
          type="button"
          disabled={isSubmitting}
          className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('cancel')}
        </button>
        <button
          onClick={onSubmit}
          type="button"
          disabled={isSubmitting || isLoadingPermissions}
          className="px-6 py-3 bg-[#1e3a2f] text-white rounded-lg text-sm font-semibold hover:bg-[#2d5547] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {t('create')}
        </button>
      </div>
    </div>
  );
};
