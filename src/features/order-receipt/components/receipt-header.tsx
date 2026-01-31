import { ScrollText } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ReceiptHeader() {
  const t = useTranslations("OrderReceipt.Header");

  return (
    <div className="p-12 pb-10 flex flex-col items-center text-center">
      <div className="flex items-center gap-2 text-[#DEA048] mb-6">
        <ScrollText size={20} />
        <b className="tracking-[4.2px] uppercase text-[14px]">{t("title")}</b>
      </div>

      <h1 className="font-display text-[30px] text-[#1A3951]">
        Au Lac Geneva
      </h1>

      <div className="text-[11px] uppercase tracking-[1.1px] text-[#475569]">
        Quai du Mont-Blanc 13, Geneva
      </div>
      <div className="text-[11px] uppercase tracking-[1.1px] text-[#475569]">
        +41 22 123 45 67
      </div>
    </div>
  );
}
