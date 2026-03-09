import React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

interface FormHeaderProps {
  title: string;
  subtitle: string;
  onBack: () => void;
  onEdit: () => void;
}

export default function FormHeader({
  title,
  subtitle,
  onBack,
  onEdit,
}: FormHeaderProps) {
  const t = useTranslations('Supplier.Detail');
  
  return (
    <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </div>
      
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
}
