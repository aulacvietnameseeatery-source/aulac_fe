"use client";

import { useSearchParams } from "next/navigation";
import { OrderSuccessData } from "../types/order.types";

export function useOrderSuccess(): OrderSuccessData {
  const searchParams = useSearchParams();

  return {
    orderNumber: searchParams.get("orderNumber") ?? "#AL-GEN-8821",
    totalAmount: searchParams.get("totalAmount") ?? "84.00 CHF",
    diningOption: searchParams.get("diningOption") ?? "Take Away",
  };
}
