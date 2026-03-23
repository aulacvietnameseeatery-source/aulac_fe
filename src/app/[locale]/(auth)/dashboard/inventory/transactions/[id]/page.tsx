"use client";

import { Suspense, use } from "react";
import { Loader2 } from "lucide-react";
import { TransactionDetail } from "@/features/staff/inventory-management";

export default function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="animate-spin text-gray-400" />
        </div>
      }
    >
      <div className="bg-[#FDFBF9] min-h-screen py-6 px-4">
        <TransactionDetail transactionId={Number(id)} />
      </div>
    </Suspense>
  );
}
