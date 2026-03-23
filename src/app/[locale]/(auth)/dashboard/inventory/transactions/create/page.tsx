"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { CreateTransactionForm } from "@/features/staff/inventory-management";

export default function CreateTransactionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="animate-spin text-gray-400" />
        </div>
      }
    >
        <CreateTransactionForm />
    </Suspense>
  );
}
