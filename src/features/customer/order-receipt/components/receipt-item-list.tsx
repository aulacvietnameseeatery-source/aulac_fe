import { ReceiptItem } from "../types/receipt.types";
import { useTranslations } from "next-intl";
import "../styles/index.css";

export default function ReceiptItemList({ items }: { items: ReceiptItem[] }) {
  const t = useTranslations("OrderReceipt.Items");

  return (
    <div className="receipt-item-list">
      {items.map((item, index) => (
        <div key={index} className="receipt-item">
          <div className="receipt-item-left">
            <div className="receipt-item-name">{item.name}</div>
            <div className="receipt-item-details">
              {t("quantity")}: {item.qty} × {item.price.toFixed(2)}
            </div>
          </div>
          <div className="receipt-item-total">{item.total.toFixed(2)} CHF</div>
        </div>
      ))}
    </div>
  );
}
