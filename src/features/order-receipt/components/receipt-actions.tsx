"use client";

import React from "react";
import { Download, Printer } from "lucide-react";
import { useTranslations } from "next-intl";

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
    <div className="w-full flex justify-center gap-4">
      
      {/* DOWNLOAD */}
      <button
        onClick={onDownload}
        className="
          flex-1 max-w-70
          bg-[#1A3951] text-white
          rounded-sm shadow-lg
          flex items-center justify-center gap-3
          py-4
          hover:bg-[#1a2c42]
          transition-all
          cursor-pointer
        "
      >
        <Download size={18} />
        <b className="text-[11px] uppercase tracking-[3px]">
          {t("download")}
        </b>
      </button>

      {/* PRINT */}
      <button
        onClick={onPrint}
        className="
          flex-1 max-w-70
          bg-white
          border border-[#CBD5E1]
          text-[#1A3951]
          rounded-sm
          flex items-center justify-center gap-3
          py-4
          hover:bg-gray-50
          transition-all
          cursor-pointer
        "
      >
        <Printer size={18} />
        <b className="text-[11px] uppercase tracking-[3px]">
          {t("print")}
        </b>
      </button>
    </div>
  );
};
