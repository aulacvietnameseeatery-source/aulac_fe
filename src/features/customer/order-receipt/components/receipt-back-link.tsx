"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import "../styles/index.css";

interface ReceiptBackLinkProps {
  href?: string;
  label?: string;
}

export default function ReceiptBackLink({
  href = "/dashboard",
} : ReceiptBackLinkProps) {
  const t = useTranslations("OrderReceipt.BackLink");

  return (
    <Link href={href} className="receipt-back-link group">
      <ArrowLeft size={14} className="receipt-back-link-icon" />
      <b className="receipt-back-link-text">{t("label")}</b>
    </Link>
  );
};
