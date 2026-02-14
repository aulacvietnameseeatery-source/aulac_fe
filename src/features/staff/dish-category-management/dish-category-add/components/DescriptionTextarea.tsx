import React from 'react';
import { useTranslations } from 'next-intl';

interface DescriptionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function DescriptionTextarea({
  value,
  onChange,
  error,
}: DescriptionTextareaProps) {
  const t = useTranslations('DishCategory.Add');
  
  return (
    <div className="mb-10">
      <label className="block text-[#1e293b] text-[13px] font-extrabold font-['Inter'] uppercase tracking-[0.5px] mb-4">
        {t('description')}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('descriptionPlaceholder')}
        rows={5}
        className={`w-full px-4 py-3.5 bg-[#f8fafc] border rounded-lg text-slate-900 text-[15px] font-['Inter'] leading-relaxed placeholder:text-slate-400 outline-none focus:bg-white transition-all resize-none ${
          error ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-slate-400'
        }`}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
