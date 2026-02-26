"use client";

import { CustomerInfoForm } from "@/features/customer/fill-infor-customer";
import { useSearchParams } from "next/navigation";

export default function FillInforCustomerPage() {
  const searchParams = useSearchParams();
  const tableNumber = searchParams.get("table") || "05";

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-stone-50 px-4 py-8">
      <CustomerInfoForm tableNumber={tableNumber} />
    </main>
  );
}
