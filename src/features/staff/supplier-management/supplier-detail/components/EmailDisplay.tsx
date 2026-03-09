"use client";

import React from 'react';
import { useTranslations } from 'next-intl';

interface EmailDisplayProps {
  value: string;
}

export default function EmailDisplay({ value }: EmailDisplayProps) {
  const t = useTranslations('Supplier.Detail');
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {t('email')}
      </label>
      <div className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50">
        {value || '-'}
      </div>
    </div>
  );
}
