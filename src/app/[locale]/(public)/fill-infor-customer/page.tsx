"use client";

import { CustomerInfoForm } from "@/features/customer/fill-infor-customer";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function FillInforCustomerPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tableNumber = searchParams.get("table");

  useEffect(() => {
    // Nếu chưa có table được chọn, redirect về trang menu
    if (!tableNumber) {
      router.replace("/menu-listing");
    }
  }, [tableNumber, router]);

  // Hiển thị loading hoặc không hiển thị gì khi đang redirect
  if (!tableNumber) {
    return null;
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-stone-50 px-4 py-8">
      <CustomerInfoForm tableNumber={tableNumber} />
    </main>
  );
}
