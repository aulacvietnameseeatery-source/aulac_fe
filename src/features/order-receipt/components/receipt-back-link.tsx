"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface ReceiptBackLinkProps {
  href?: string;
  label?: string;
}

export default function ReceiptBackLink({
  href = "/dashboard",
  label = "Return to Dashboard",
} : ReceiptBackLinkProps) {
  return (
    <Link
      href={href}
      className="
        flex items-center gap-2
        text-[#64748B]
        hover:text-[#1A3951]
        transition-colors
        group
      "
    >
      <ArrowLeft
        size={14}
        className="transition-transform group-hover:-translate-x-1"
      />
      <b className="text-[11px] uppercase tracking-[1px]">
        {label}
      </b>
    </Link>
  );
};
