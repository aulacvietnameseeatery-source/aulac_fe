import { CreditCard } from "lucide-react";

export default function ReceiptPaymentFooter({ paymentMethod }: { paymentMethod: string }) {
  return (
    <div className="border-t border-dashed border-[#475569] py-6 flex justify-center">
      <div className="flex items-center gap-2 px-4 py-1.5 bg-[#1e293b] rounded-full text-white text-[10px]">
        <CreditCard size={14} />
        <b className="uppercase tracking-[1px]">
          Paid via {paymentMethod}
        </b>
      </div>
    </div>
  );
}
