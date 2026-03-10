"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useSupplier, useUpdateSupplier } from '../hooks/useEditSupplier';
import FormHeader from './FormHeader';
import FormCard from './FormCard';
import SupplierNameInput from './SupplierNameInput';
import PhoneInput from './PhoneInput';
import EmailInput from './EmailInput';
import IngredientsSelect from './IngredientsSelect';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import { FormErrors } from '../types';

interface EditSupplierProps {
  supplierId: string;
}

export default function EditSupplier({ supplierId }: EditSupplierProps) {
  const router = useRouter();
  const t = useTranslations('Supplier.Edit');
  const [supplierName, setSupplierName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [ingredientIds, setIngredientIds] = useState<number[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});

  const numericId = parseInt(supplierId, 10);
  const { supplier, isLoading, error: fetchError } = useSupplier(numericId);
  const { updateSupplier, isLoading: isUpdating, error: updateError } = useUpdateSupplier();

  useEffect(() => {
    if (supplier) {
      setSupplierName(supplier.supplierName);
      setPhone(supplier.phone || '');
      setEmail(supplier.email || '');
      setIngredientIds(supplier.ingredients.map(i => i.ingredientId));
    }
  }, [supplier]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!supplierName.trim()) {
      newErrors.supplierName = t('validation.nameRequired');
    } else if (supplierName.length > 200) {
      newErrors.supplierName = t('validation.nameMaxLength');
    }

    if (phone) {
      if (phone.length > 50) {
        newErrors.phone = t('validation.phoneMaxLength');
      } else if (!/^\d+$/.test(phone.trim())) {
        newErrors.phone = t('validation.phoneInvalid');
      }
    }

    if (email) {
      if (email.length > 150) {
        newErrors.email = t('validation.emailMaxLength');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = t('validation.emailInvalid');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
      toast.error(t('validation.fixErrors'));
      return;
    }

    try {
      await updateSupplier(numericId, {
        supplierName: supplierName.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        ingredientIds,
      });
      
      router.push('/dashboard/suppliers');
    } catch (error) {
      console.error('Failed to update supplier:', error);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (fetchError) {
    return (
      <ErrorState
        error={fetchError}
        onBackToList={() => router.push('/dashboard/suppliers')}
      />
    );
  }

  return (
    <div className="bg-white">
      <div className="px-8">
        <FormHeader
          title={t('title')}
          subtitle={t('subtitle')}
          onCancel={handleCancel}
          onSave={handleUpdate}
          isLoading={isUpdating}
          saveButtonText={t('saveButton')}
        />

        <FormCard error={updateError}>
          <SupplierNameInput
            value={supplierName}
            onChange={setSupplierName}
            error={errors.supplierName}
          />
          
          <PhoneInput
            value={phone}
            onChange={setPhone}
            error={errors.phone}
          />

          <EmailInput
            value={email}
            onChange={setEmail}
            error={errors.email}
          />

          <IngredientsSelect
            value={ingredientIds}
            onChange={setIngredientIds}
          />
        </FormCard>
      </div>
    </div>
  );
}
