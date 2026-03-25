import Link from "next/link";
import { useTranslations } from "next-intl";
import "../styles/index.css";

export default function OrderActions() {
  const t = useTranslations("orders.success.Actions");

  return (
    <div className="order-actions-wrapper">
      <button
        onClick={() => window.print()}
        className="order-print-button"
      >
        <b className="order-print-button-text">{t("viewReceipt")}</b>
      </button>

      <Link href="/" className="order-home-link">
        <b className="order-home-link-text">{t("backHome")}</b>
      </Link>
    </div>
  );
}
