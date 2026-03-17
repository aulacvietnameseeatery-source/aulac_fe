"use client";

import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import SaleInvoiceList from '@/features/staff/invoices/components/SaleInvoiceList';

const SaleInvoiceListContent = () => {
  return <SaleInvoiceList />;
};

export default function InvoiceListPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" />
      </div>
    }>
      <SaleInvoiceListContent />
    </Suspense>
  );
}
