"use client";

import { OrderSuccessHeader } from "./OrderSuccessHeader";
import { OrderSummaryCard } from "./OrderSummaryCard";
import { OrderLocation } from "./OrderLocation";
import { OrderActions } from "./OrderActions";
import { useOrderSuccess } from "../hooks/useOrderSuccess";

export function OrderSuccessView() {
  const order = useOrderSuccess();

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-10 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
      <OrderSuccessHeader />
      <OrderSummaryCard {...order} />
      <OrderLocation />
      <OrderActions />
    </div>
  );
}
