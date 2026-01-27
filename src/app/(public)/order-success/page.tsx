'use client';

import {
  useOrderSuccess,
  OrderSuccessView,
  OrderLoading,
  OrderNotFound,
} from '@/features/order';

export default function Page() {
  const { data, loading, error } = useOrderSuccess();

  return (
    <main className="min-h-screen bg-[#FDFBF7] px-4 py-16 flex justify-center">
      {loading && <OrderLoading />}
      {!loading && (error || !data) && <OrderNotFound />}
      {!loading && data && <OrderSuccessView data={data} />}
    </main>
  );
}
