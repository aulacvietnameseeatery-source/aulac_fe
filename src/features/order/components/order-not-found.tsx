import Link from "next/link";
import { SearchX } from "lucide-react";
import { useTranslations } from "next-intl";

export default function OrderNotFound() {
  const t = useTranslations("OrderSuccess.NotFound");

  return (
    <div className="w-full min-h-100 flex flex-col items-center justify-center gap-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
        <SearchX size={40} strokeWidth={1.5} className="text-slate-400" />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="font-display font-semibold text-3xl text-[#1A3951]">
          {t("title")}
        </h1>
        <p className="text-slate-500 text-sm max-w-xs mx-auto">
          {t("description")}
        </p>
      </div>

      <Link
        href="/"
        className="px-8 h-12 bg-[#1A3951] text-white rounded-sm shadow-md hover:bg-[#1a2c42] transition flex items-center justify-center"
      >
        <b className="tracking-[2px] uppercase text-xs">{t("cta")}</b>
      </Link>
    </div>
  );
}