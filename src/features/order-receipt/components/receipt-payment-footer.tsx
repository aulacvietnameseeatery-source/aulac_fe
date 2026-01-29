import { CreditCard } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ReceiptPaymentFooter({ paymentMethod }: { paymentMethod: string }) {
  const t = useTranslations("OrderReceipt.Payment");

  return (
    <div className="border-t border-dashed border-[#475569] py-6 flex justify-center">
      <div className="flex items-center gap-2 px-4 py-1.5 bg-[#1e293b] rounded-full text-white text-[10px]">
        <CreditCard size={14} />
        <b className="uppercase tracking-[1px]">
          {t("label")}: {paymentMethod}
        </b>
      </div>
    </div>
  );
}
