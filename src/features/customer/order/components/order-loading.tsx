import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import "../styles/index.css";

export default function OrderLoading() {
  const t = useTranslations("orders.success.Loading");

  return (
    <div className="order-loading-wrapper fade-in animate-in">
      <Loader2 size={48} className="order-loading-spinner" />
      <div className="order-loading-content">
        <h2 className="order-success-title">{t("title")}</h2>
        <p className="text-slate-400 text-xs tracking-widest uppercase">
          {t("subtitle")}
        </p>
      </div>
    </div>
  );
}