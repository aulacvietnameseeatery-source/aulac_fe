"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { InventoryManagement } from "@/features/staff/inventory-management";

export default function InventoryItemsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="animate-spin text-gray-400" />
        </div>
      }
    >
      <InventoryManagement defaultTab="items" />
    </Suspense>
  );
}
