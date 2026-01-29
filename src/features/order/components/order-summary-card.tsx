import { Clock } from "lucide-react";
import { useTranslations } from "next-intl";

interface OrderSummaryProps {
  orderNumber: string;
  totalAmount: string;
  diningOption: 'DINE_IN' | 'TAKE_AWAY';
  readyInMinutes?: number;
}

export default function OrderSummaryCard({
  orderNumber,
  totalAmount,
  diningOption,
  readyInMinutes
}: OrderSummaryProps) {
  const t = useTranslations("OrderSuccess.Summary");
  const tDining = useTranslations("OrderSuccess.DiningOption");

  return (
    <div className="w-full bg-white shadow-[0px_20px_60px_-15px_rgba(26,57,81,0.06)] border rounded-sm px-6 md:px-12 py-10 flex flex-col gap-8 text-left">
      
      <div className="flex flex-col md:flex-row gap-8">
        <InfoBlock label={t("orderNumber")} value={orderNumber} />
        <InfoBlock label={t("totalAmount")} value={totalAmount} />
        <InfoBlock label={t("diningOption")} value={diningOption} />
      </div>

      <div className="h-px bg-slate-200" />

      <div className="flex flex-col items-center gap-3 text-center">
        <div className="font-display italic text-slate-600">
           “{t("quote")}”
        </div>

        <div className="flex items-center gap-2 text-[12px] text-[#DEA048]">
          <Clock size={16} />
          <b className="tracking-[1.2px] uppercase">{t("readyIn", { minutes: readyInMinutes ?? '20' })}</b>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 flex flex-col gap-2">
      <b className="tracking-[1px] uppercase text-xs text-slate-400">
        {label}
      </b>
      <div className="font-display font-normal text-[20px] text-[#1A3951]">
        {value}
      </div>
    </div>
  );
}
