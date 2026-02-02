'use client';

import {
  useOrderReceipt,
  useReceiptActions,
  ReceiptHeader,
  ReceiptInfoStrip,
  ReceiptItemList,
  ReceiptSummary,
  ReceiptPaymentFooter,
  ReceiptActions,
  ReceiptBackLink,
} from '@/features/order-receipt';

export default function OrderReceiptPage() {
  const { order, subtotal, totalAmount } = useOrderReceipt();
  const { downloadPdf, printReceipt } = useReceiptActions(order.id);

  return (
    <main className="min-h-screen bg-[#F8F9FA] flex justify-center py-16 px-4">
      <div className="w-full max-w-xl flex flex-col items-center gap-8">
        <div id="receipt-print-area" className="w-full bg-white shadow-[0px_20px_50px_-15px_rgba(26,57,81,0.08)] rounded-sm border border-[#1A3951] overflow-hidden">
          <ReceiptHeader />
          <ReceiptInfoStrip order={order} />
          <ReceiptItemList items={order.items} />
          <ReceiptSummary subtotal={subtotal} tips={order.tips} total={totalAmount} />
          <ReceiptPaymentFooter paymentMethod={order.paymentMethod} />
        </div>

        <ReceiptActions 
          onDownload={downloadPdf}
          onPrint={printReceipt}
        />
        <ReceiptBackLink />
      </div>
    </main>
  );
}