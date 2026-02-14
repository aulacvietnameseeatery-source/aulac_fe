// src/features/auth/role-detail/components/RoleDetailHeader.tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

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
        <Button
          onClick={onBack}
          type="button"
          variant="outline"
          className="shadow-md"
        >
          {t('back')}
        </Button>
        <Button
          onClick={onEdit}
          type="button"
          variant="outline"
          className="shadow-md bg-blue-600 text-white hover:bg-blue-700 border-none"
        >
          {t('edit')}
        </Button>
      </div>
    </div>
  );
};
