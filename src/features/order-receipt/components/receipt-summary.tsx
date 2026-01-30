import { useTranslations } from "next-intl";

export default function ReceiptSummary({
  subtotal,
  tips,
  total,
}: {
  subtotal: number;
  tips: number;
  total: number;
}) {
  const t = useTranslations("OrderReceipt.Summary");

  return (
    <div className="bg-[#F8F9FA] px-6 py-6 mx-12 mb-8 border border-[#E2E8F0] rounded-sm space-y-3">
      <Row label={t("subtotal")} value={`${subtotal.toFixed(2)} CHF`} />
      <Row label={t("tips")} value={`${tips.toFixed(2)} CHF`} />

      <div className="h-px bg-[#475569]/30 my-2" />

      <div className="flex justify-between items-center">
        <b className="text-[10px] uppercase tracking-[2px]">{t("total")}</b>
        <b className="font-display text-[24px]">{total.toFixed(2)} CHF</b>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[12px]">
      <span className="font-medium">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
