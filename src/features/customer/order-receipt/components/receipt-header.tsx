import { ScrollText } from "lucide-react";
import { useTranslations } from "next-intl";
import "../styles/index.css";

export default function ReceiptHeader() {
  const t = useTranslations("OrderReceipt.Header");

  return (
    <div className="receipt-container">
      <div className="receipt-title-wrapper">
        <ScrollText size={20} />
        <b className="receipt-title-text">{t("title")}</b>
      </div>

      <h1 className="receipt-restaurant-name">Au Lac Geneva</h1>

      <div className="receipt-info-text">Quai du Mont-Blanc 13, Geneva</div>
      <div className="receipt-info-text">+41 22 123 45 67</div>
    </div>
  );
}
