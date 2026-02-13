// src/features/auth/role-create/components/RoleCreateHeader.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

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
        <Button
          onClick={onCancel}
          type="button"
          variant="outline"
          size="lg"
          disabled={isSubmitting}
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          {t('cancel')}
        </Button>
        <Button
          onClick={onSubmit}
          type="button"
          size="lg"
          isLoading={isSubmitting}
          disabled={isSubmitting || isLoadingPermissions}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          {t('create')}
        </Button>
      </div>
    </div>
  );
};
