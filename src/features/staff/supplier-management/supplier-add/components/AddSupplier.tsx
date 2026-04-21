"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useCreateSupplier } from '../hooks/useCreateSupplier';
import FormHeader from './FormHeader';
import FormCard from './FormCard';
import SupplierNameInput from './SupplierNameInput';
import PhoneInput from './PhoneInput';
import EmailInput from './EmailInput';
import IngredientsSelect from './IngredientsSelect';
import AddressInput from './AddressInput';
import TaxCodeInput from './TaxCodeInput';
import { FormErrors } from '../types';

export default function AddSupplier() {
  const router = useRouter();
  const t = useTranslations('Supplier.Add');
  const [supplierName, setSupplierName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [ingredientIds, setIngredientIds] = useState<number[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});

  const { createSupplier, isLoading, error } = useCreateSupplier();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!supplierName.trim()) {
      newErrors.supplierName = t('validation.nameRequired');
    } else if (supplierName.length > 200) {
      newErrors.supplierName = t('validation.nameMaxLength');
    }

    if (phone) {
      if (phone.length > 15) {
        newErrors.phone = t('validation.phoneMaxLength');
      } else if (!/^((0|\+84)[0-9]{9,10}|(\+41|0)[1-9][0-9]{7})$/.test(phone.trim())) {
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

    if (address && address.length > 500) {
      newErrors.address = t('validation.addressMaxLength');
    }

    if (taxCode && taxCode.length > 50) {
      newErrors.taxCode = t('validation.taxCodeMaxLength');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error(t('validation.fixErrors'));
      return;
    }

    try {
      await createSupplier({
        supplierName: supplierName.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        taxCode: taxCode.trim() || undefined,
        ingredientIds,
      });
      
      router.push('/dashboard/suppliers');
    } catch (error) {
      console.error('Failed to create supplier:', error);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="bg-white">
      <div className="px-8">
        <FormHeader
          title={t('title')}
          subtitle={t('subtitle')}
          onCancel={handleCancel}
          onSave={handleSave}
          isLoading={isLoading}
          saveButtonText={t('saveButton')}
        />

        <FormCard error={error}>
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

          <AddressInput
            value={address}
            onChange={setAddress}
            error={errors.address}
          />

          <TaxCodeInput
            value={taxCode}
            onChange={setTaxCode}
            error={errors.taxCode}
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
