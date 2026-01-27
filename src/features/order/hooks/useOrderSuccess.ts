"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getOrderSuccess } from '../services/order.service';
import { OrderSuccessData } from '../types/order-success.types';

export function useOrderSuccess() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [data, setData] = useState<OrderSuccessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError(new Error('Missing orderId'));
      setLoading(false);
      return;
    }

    getOrderSuccess(orderId)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [orderId]);

  return { data, loading, error };
}
