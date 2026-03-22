import { useTranslations } from "next-intl";
import "../styles/index.css";

export default function ReceiptSummary({
  subtotal,
  tips,
  total,
}: {
  subtotal: number;
  tips: number;
  total: number;
}) {
  const t = useTranslations("orders.receipt.Summary");

  return (
    <div className="receipt-summary-container">
      <Row label={t("subtotal")} value={`${subtotal.toFixed(2)} CHF`} />
      <Row label={t("tips")} value={`${tips.toFixed(2)} CHF`} />

      <div className="receipt-divider" />

      <div className="receipt-total-row">
        <b className="receipt-total-label">{t("total")}</b>
        <b className="receipt-total-value">{total.toFixed(2)} CHF</b>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="receipt-row">
      <span className="receipt-row-label">{label}</span>
      <span className="receipt-row-value">{value}</span>
    </div>
  );
}
