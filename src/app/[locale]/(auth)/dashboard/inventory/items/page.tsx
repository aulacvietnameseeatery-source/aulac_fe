"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { InventoryManagement } from "@/features/staff/inventory-management";
import { ProtectedRoute } from "@/components/protected-route";
import { Permissions } from "@/types/const";

export default function InventoryItemsPage() {
  return (
    <ProtectedRoute permission={Permissions.ViewInventory}>
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center">
            <Loader2 className="animate-spin text-gray-400" />
          </div>
        }
      >
        <InventoryManagement defaultTab="items" />
      </Suspense>
    </ProtectedRoute>
  );
}
