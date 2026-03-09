"use client";

import React from 'react';
import { useTranslations } from 'next-intl';

interface SupplierNameDisplayProps {
  value: string;
}

export default function SupplierNameDisplay({ value }: SupplierNameDisplayProps) {
  const t = useTranslations('Supplier.Detail');
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {t('supplierName')} <span className="text-red-500">*</span>
      </label>
      <div className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50">
        {value}
      </div>
    </div>
  );
}
