"use client";

import OrderSuccessHeader from "./order-success-header";
import OrderSummaryCard from "./order-summary-card";
import OrderLocation from "./order-location";
import OrderActions from "./order-actions";
import "../styles/index.css";

import { OrderSuccessData } from "../types/order-success.types";

interface Props {
  data: OrderSuccessData;
}

export default function OrderSuccessView({ data }: Props) {

  return (
    <div className="order-success-view-wrapper fade-in slide-in-from-bottom-8 animate-in">
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
