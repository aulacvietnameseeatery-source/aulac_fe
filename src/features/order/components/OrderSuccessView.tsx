"use client";

import { OrderSuccessHeader } from "./OrderSuccessHeader";
import { OrderSummaryCard } from "./OrderSummaryCard";
import { OrderLocation } from "./OrderLocation";
import { OrderActions } from "./OrderActions";
import { useOrderSuccess } from "../hooks/useOrderSuccess";

export function OrderSuccessView() {
  const { data, loading, error } = useOrderSuccess();
  if (loading) return (<div></div>);
  console.log(data)
  if (!data) return (<div></div>);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-10 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
      <OrderSuccessHeader />
      <OrderSummaryCard 
        orderNumber={data.orderNumber}
        totalAmount={`${data.totalAmount} ${data.currency}`}
        diningOption={data.diningOption} 
      />
      <OrderLocation />
      <OrderActions />
    </div>
  );
}
