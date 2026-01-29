import { ReceiptItem } from "../types/receipt.types";
import { useTranslations } from "next-intl";

export default function ReceiptItemList({ items }: { items: ReceiptItem[] }) {
  const t = useTranslations("OrderReceipt.Items");

  return (
    <div className="px-12 py-10 space-y-6">
      {items.map((item, index) => (
        <div key={index} className="flex justify-between gap-5 text-[14px] text-[#1A3951]">
          <div>
            <div className="font-medium">{item.name}</div>
            <div className="text-[10px] uppercase tracking-[1px] text-[#94A3B8]">
              {t("quantity")}: {item.qty} × {item.price.toFixed(2)}
            </div>
          </div>
          <b>{item.total.toFixed(2)} CHF</b>
        </div>
      ))}
    </div>
  );
}
