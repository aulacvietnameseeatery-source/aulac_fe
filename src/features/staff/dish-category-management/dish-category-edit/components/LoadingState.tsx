import React from 'react';
import { useTranslations } from 'next-intl';

export default function LoadingState() {
  const t = useTranslations('DishCategory.Edit');
  
  return (
    <div className="w-full bg-[#F8F9FA] flex items-center justify-center py-20">
      <div className="text-slate-600 text-[15px] font-['Inter']">{t('loading')}</div>
    </div>
  );
}
