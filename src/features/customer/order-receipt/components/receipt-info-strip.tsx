import { OrderReceipt } from "../types/receipt.types";
import { useTranslations } from "next-intl";
import "../styles/index.css";

export default function ReceiptInfoStrip({ order, showStatus = true }: { order: OrderReceipt, showStatus?: boolean }) {
  const t = useTranslations("orders.receipt.InfoStrip");

  return (
    <div className="receipt-info-strip">
      <Info label={t("date")} value={order.date} />
      <Info label={t("orderNumber")} value={order.id} align="right" />
      <Info label={t("time")} value={order.time} />
      {showStatus && <Info label={t("status")} value={order.status} align="right" highlight />}
    </div>
  );
}

function Info({
  label,
  value,
  align,
  highlight,
}: {
  label: string;
  value: string;
  align?: "right";
  highlight?: boolean;
}) {
  return (
    <div
      className={`receipt-info-item ${align === "right" ? "receipt-info-item-right" : ""}`}
    >
      <b className="receipt-info-label">{label}</b>
      <div
        className={`receipt-info-value ${highlight ? "receipt-info-value-highlight" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}
