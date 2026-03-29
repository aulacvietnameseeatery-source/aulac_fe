"use client";

import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { SupplierDetail } from '@/features/staff/supplier-management/supplier-detail';
import { ProtectedRoute } from "@/components/protected-route";
import { Permissions } from "@/types/const";

const SupplierDetailContent = () => {
  return <SupplierDetail />;
};

export default function SupplierDetailPage() {
  return (
    <ProtectedRoute permission={Permissions.ViewSupplier}>
      <Suspense fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="animate-spin text-gray-400" />
        </div>
      }>
        <SupplierDetailContent />
      </Suspense>
    </ProtectedRoute>
  );
}
