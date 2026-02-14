import React from 'react';
import { useTranslations } from 'next-intl';

interface ErrorStateProps {
  error: string;
  onBackToList: () => void;
}

export default function ErrorState({ error, onBackToList }: ErrorStateProps) {
  const t = useTranslations('DishCategory.Edit');
  
  return (
    <div className="w-full bg-[#F8F9FA] flex items-center justify-center py-20">
      <div className="text-center">
        <div className="text-red-600 text-lg mb-4">Error: {error}</div>
        <button
          onClick={onBackToList}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-white text-sm font-medium"
        >
          {t('backToList')}
        </button>
      </div>
    </div>
  );
}
