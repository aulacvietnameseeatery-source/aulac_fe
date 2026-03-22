import { ScrollText } from "lucide-react";
import { useTranslations } from "next-intl";
import "../styles/index.css";
import { useStoreSettings } from "@/hooks/use-store-settings";

export default function ReceiptHeader() {
  const t = useTranslations("orders.receipt.Header");
  const { data: storeSettings } = useStoreSettings();

  return (
    <div className="receipt-container">
      <div className="receipt-title-wrapper">
        <ScrollText size={20} />
        <b className="receipt-title-text">{t("title")}</b>
      </div>

      <h1 className="receipt-restaurant-name">{storeSettings?.name || "An Lac"}</h1>

      <div className="receipt-info-text">
        {storeSettings?.streetAddress && storeSettings?.city
          ? `${storeSettings.streetAddress}, ${storeSettings.city}`
          : ""}
      </div>
      <div className="receipt-info-text">{storeSettings?.phone || ""}</div>
    </div>
  );
}
