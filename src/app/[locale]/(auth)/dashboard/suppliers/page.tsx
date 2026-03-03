"use client";

import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { SupplierList } from '@/features/staff/supplier-management/supplier-list';

const SupplierListContent = () => {
  return <SupplierList />;
};

export default function SupplierPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" />
      </div>
    }>
      <SupplierListContent />
    </Suspense>
  );
}
