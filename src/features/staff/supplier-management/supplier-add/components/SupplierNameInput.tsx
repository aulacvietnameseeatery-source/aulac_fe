"use client";

import React from 'react';
import { useTranslations } from 'next-intl';

interface SupplierNameInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function SupplierNameInput({ value, onChange, error }: SupplierNameInputProps) {
  const t = useTranslations('Supplier.Add');
  
  return (
    <div>
      <label htmlFor="supplierName" className="block text-sm font-medium text-gray-700 mb-2">
        {t('supplierName')} <span className="text-red-500">*</span>
      </label>
      <input
        id="supplierName"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('supplierNamePlaceholder')}
        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300'
        }`}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
