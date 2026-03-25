import { CreditCard } from "lucide-react";
import { useTranslations } from "next-intl";
import "../styles/index.css";

export default function ReceiptPaymentFooter({ paymentMethod }: { paymentMethod: string }) {
  const t = useTranslations("orders.receipt.Payment");

  return (
    <div className="receipt-payment-footer">
      <div className="receipt-payment-badge">
        <CreditCard size={14} />
        <b className="receipt-payment-text">
          {t("label")}: {paymentMethod}
        </b>
      </div>
    </div>
  );
}
