"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';

export default function LoadingState() {
  const t = useTranslations('Supplier.Detail');
  
  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">{t('loading')}</p>
      </div>
    </div>
  );
}
