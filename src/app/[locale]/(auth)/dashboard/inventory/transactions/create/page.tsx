"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { CreateTransactionForm } from "@/features/staff/inventory-management";
import { ProtectedRoute } from "@/components/protected-route";
import { Permissions } from "@/types/const";

export default function CreateTransactionPage() {
  return (
    <ProtectedRoute permission={Permissions.CreateInventoryTx}>
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center">
            <Loader2 className="animate-spin text-gray-400" />
          </div>
        }
      >
        <CreateTransactionForm />
      </Suspense>
    </ProtectedRoute>
  );
}
