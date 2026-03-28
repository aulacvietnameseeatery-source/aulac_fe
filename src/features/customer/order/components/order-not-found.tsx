import { Link } from "@/routing"
import { SearchX } from "lucide-react";
import { useTranslations } from "next-intl";
import "../styles/index.css";

export default function OrderNotFound() {
  const t = useTranslations("orders.success.NotFound");

  return (
    <div className="order-not-found-wrapper fade-in animate-in slide-in-from-bottom-4">
      <div className="order-not-found-icon">
        <SearchX size={40} strokeWidth={1.5} className="order-not-found-icon-inner" />
      </div>

      <div className="order-not-found-content">
        <h1 className="order-success-title text-3xl">
          {t("title")}
        </h1>
        <p className="text-slate-500 text-sm max-w-xs mx-auto">
          {t("description")}
        </p>
      </div>

      <Link
        href="/"
        className="order-not-found-cta"
      >
        <b className="tracking-widest uppercase text-xs">{t("cta")}</b>
      </Link>
    </div>
  );
}