import { Suspense } from "react";
import { OrderSuccessView } from "@/features/order/components/OrderSuccessView";

export default function OrderSuccessPage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] px-4 py-16 flex justify-center">
      <Suspense fallback={<div>Loading...</div>}>
        <OrderSuccessView />
      </Suspense>
    </main>
  );
}
