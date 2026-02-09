import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import "../styles/index.css";

export default function OrderLocation() {
  const t = useTranslations("OrderSuccess.Location");

  return (
    <div className="order-location-wrapper">
      <div className="order-location-label-wrapper">
        <MapPin size={16} />
        <b className="order-location-label">{t("label")}</b>
      </div>

      <div className="order-location-address">{t("address")}</div>
    </div>
  );
}
