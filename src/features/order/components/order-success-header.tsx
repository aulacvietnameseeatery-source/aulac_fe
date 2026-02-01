import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

export default function OrderSuccessHeader() {
  const t = useTranslations("OrderSuccess.Header");

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="w-20 h-20 rounded-xl bg-[#FBFAF7] border border-[#E6DFC8] flex items-center justify-center">
        <Check size={40} strokeWidth={2} className="text-[#C9A961]" />
      </div>

      <h1 className="font-display font-semibold text-[48px] text-[#1A3951]">
        {t("title")}
      </h1>

      <div className="tracking-[2px] uppercase font-semibold text-sm text-slate-500">
        {t("subtitle")}
      </div>
    </div>
  );
}
