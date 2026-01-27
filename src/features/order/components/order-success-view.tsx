"use client";

import OrderSuccessHeader from "./order-success-header";
import OrderSummaryCard from "./order-summary-card";
import OrderLocation from "./order-location";
import OrderActions from "./order-actions";

import { OrderSuccessData } from "../types/order-success.types";

interface Props {
  data: OrderSuccessData;
}

export default function OrderSuccessView({ data }: Props) {

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
