"use client";

import { ReceiptHeader } from "./ReceiptHeader";
import { ReceiptInfoStrip } from "./ReceiptInfoStrip";
import { ReceiptItemList } from "./ReceiptItemList";
import { ReceiptSummary } from "./ReceiptSummary";
import { ReceiptPaymentFooter } from "./ReceiptPaymentFooter";
import ReceiptActions from "./ReceiptActions";
import ReceiptBackLink from "./ReceiptBackLink";
import { useOrderReceipt } from "../hooks/useOrderReceipt";

export function OrderReceiptView() {
  const { order, subtotal, totalAmount } = useOrderReceipt();

  return (
    <div className="w-full max-w-xl flex flex-col items-center gap-8">
      <div className="w-full bg-white shadow-[0px_20px_50px_-15px_rgba(26,57,81,0.08)] rounded-sm border border-[#1A3951] overflow-hidden">
        <ReceiptHeader />
        <ReceiptInfoStrip order={order} />
        <ReceiptItemList items={order.items} />
        <ReceiptSummary subtotal={subtotal} tips={order.tips} total={totalAmount} />
        <ReceiptPaymentFooter paymentMethod={order.paymentMethod} />
      </div>

      <ReceiptActions />
      <ReceiptBackLink />
    </div>
  );
}
