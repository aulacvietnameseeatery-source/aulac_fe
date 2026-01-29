import Link from "next/link";
import { useTranslations } from "next-intl";

export default function OrderActions() {
  const t = useTranslations("OrderSuccess.Actions");

  return (
    <div className="w-full flex flex-col md:flex-row gap-4 justify-center">
      <button
        onClick={() => window.print()}
        className="w-full md:w-80 h-14 bg-[#1A3951] text-white rounded-sm shadow-lg hover:bg-[#1a2c42] transition"
      >
        <b className="tracking-[3px] uppercase text-xs">{t("viewReceipt")}</b>
      </button>

      <Link
        href="/"
        className="w-full md:w-80 h-14 border border-slate-300 rounded-sm flex items-center justify-center hover:bg-slate-50 transition"
      >
        <b className="tracking-[3px] uppercase text-xs text-[#1A3951]">
           {t("backHome")}
        </b>
      </Link>
    </div>
  );
}
