"use client";

import { useState, useEffect } from 'react';
import { editSupplierService } from '../services/editSupplierService';
import { Supplier, UpdateSupplierRequest } from '../types';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export const useSupplier = (id: number) => {
  const t = useTranslations('Supplier.Edit');
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        setIsLoading(true);
        const data = await editSupplierService.getSupplier(id);
        setSupplier(data);
      } catch (err: any) {
        const errorMessage = err.response?.data?.userMessage || t('notifications.loadError');
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchSupplier();
    }
  }, [id, t]);

  return { supplier, isLoading, error };
};

export const useUpdateSupplier = () => {
  const t = useTranslations('Supplier.Edit');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateSupplier = async (id: number, request: UpdateSupplierRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await editSupplierService.updateSupplier(id, request);
      toast.success(t('notifications.updateSuccess'));
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.userMessage || t('notifications.updateError');
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateSupplier, isLoading, error };
};
