import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import "../styles/index.css";
import { useStoreSettings } from "@/hooks/use-store-settings";

export default function OrderLocation() {
  const t = useTranslations("orders.success.Location");
  const { data: storeSettings } = useStoreSettings();

  const address = storeSettings?.streetAddress && storeSettings?.city
    ? `${storeSettings.streetAddress}, ${storeSettings.city}`
    : "";

  return (
    <div className="order-location-wrapper">
      <div className="order-location-label-wrapper">
        <MapPin size={16} />
        <b className="order-location-label">{t("label")}</b>
      </div>

      <div className="order-location-address">{address}</div>
    </div>
  );
}
