"use client";

import { useState } from 'react';
import { createSupplierService } from '../services/createSupplierService';
import { CreateSupplierRequest } from '../types';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export const useCreateSupplier = () => {
  const t = useTranslations('Supplier.Add');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSupplier = async (request: CreateSupplierRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createSupplierService.createSupplier(request);
      toast.success(t('notifications.createSuccess'));
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.userMessage || t('notifications.createError');
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { createSupplier, isLoading, error };
};
