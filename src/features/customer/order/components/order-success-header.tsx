import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import "../styles/index.css";

export default function OrderSuccessHeader() {
  const t = useTranslations("orders.success.Header");

  return (
    <div className="order-success-wrapper">
      <div className="order-success-icon-box">
        <Check size={40} strokeWidth={2} className="order-success-icon" />
      </div>

      <h1 className="order-success-title">{t("title")}</h1>

      <div className="order-success-subtitle">{t("subtitle")}</div>
    </div>
  );
}
