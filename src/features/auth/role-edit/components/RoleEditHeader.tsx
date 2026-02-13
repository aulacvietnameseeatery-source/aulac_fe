// src/features/auth/role-edit/components/RoleEditHeader.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

type Props = {
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: () => void;
};

export const RoleEditHeader = ({ isSubmitting, onCancel, onSubmit }: Props) => {
  const t = useTranslations('Role.Edit');

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
          disabled={isSubmitting}
          className="bg-blue-600 text-white hover:bg-blue-700"
        >
          {t('save')}
        </Button>
      </div>
    </div>
  );
};
