"use client";

import React from "react";
import { Download, Printer } from "lucide-react";
import { useTranslations } from "next-intl";
import "../styles/index.css";

interface ReceiptActionsProps {
  onDownload?: () => void;
  onPrint?: () => void;
}

export default function ReceiptActions({
  onDownload,
  onPrint,
} : ReceiptActionsProps) {
  const t = useTranslations("OrderReceipt.Actions");

  return (
    <div className="receipt-actions-wrapper">
      <button
        onClick={onDownload}
        className="receipt-download-button"
      >
        <Download size={18} />
        <b className="text-xs uppercase tracking-widest">
          {t("download")}
        </b>
      </button>

      <button
        onClick={onPrint}
        className="receipt-print-button"
      >
        <Printer size={18} />
        <b className="text-xs uppercase tracking-widest">
          {t("print")}
        </b>
      </button>
    </div>
  );
};
