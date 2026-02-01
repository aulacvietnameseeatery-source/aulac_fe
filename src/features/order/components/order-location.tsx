import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

export default function OrderLocation() {
  const t = useTranslations("OrderSuccess.Location");

  return (
    <div className="w-full flex flex-col items-center gap-1.5">
      <div className="flex items-center gap-2 text-slate-400">
        <MapPin size={16} />
        <b className="tracking-[1px] uppercase text-xs">
          {t("label")}
        </b>
      </div>

      <div className="font-display text-[16px] text-[#1A3951]">
        {t("address")}
      </div>
    </div>
  );
}
