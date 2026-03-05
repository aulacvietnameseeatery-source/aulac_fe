"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  error: string;
  onBackToList: () => void;
}

export default function ErrorState({ error, onBackToList }: ErrorStateProps) {
  const t = useTranslations('Supplier.Edit');
  
  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {t('errorTitle')}
        </h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button onClick={onBackToList} className="w-full">
          {t('backToList')}
        </Button>
      </div>
    </div>
  );
}
