"use client";
import React from "react";
import { RefreshCcw, Upload, BarChart3 } from "lucide-react";
import { useTranslations } from "next-intl";
import { ALCard } from "@/components/ui/al-card";

export function ReportHeader({ onRefresh }: { onRefresh: () => void }) {
    const t = useTranslations("reports.header");

    return (
        <ALCard padding="sm" variant="default" elevation="sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1A3A52]/10">
                        <BarChart3 size={16} className="text-[#1A3A52]" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold tracking-wide text-[#1A3A52]">
                            {t("title")}
                        </h3>
                        <p className="text-xs text-[#1A3A52]/60">
                            {t("description", { defaultValue: "Track and analyze your restaurant performance" })}
                        </p>
                    </div>
                    <button
                        onClick={onRefresh}
                        className="p-1 rounded-full border border-[#D5BA98]/60 text-[#1A3A52]/60 hover:bg-[#D5BA98]/10 transition-colors"
                    >
                        <RefreshCcw size={13} />
                    </button>
                </div>
                <div className="relative group">
                    <button className="inline-flex items-center px-3 py-1.5 rounded-lg border border-[#D5BA98]/60 bg-white text-xs font-medium text-[#1A3A52] hover:bg-[#D5BA98]/10 transition-colors shadow-sm">
                        <Upload size={14} className="mr-2" /> {t("export")}
                    </button>
                    <div className="absolute right-0 mt-1 w-40 rounded-lg border border-[#D5BA98]/40 bg-white shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        <ul className="py-1 text-xs text-[#1A3A52]/80">
                            <li><a href="#" className="block px-4 py-2 hover:bg-[#D5BA98]/10">{t("exportPdf")}</a></li>
                            <li><a href="#" className="block px-4 py-2 hover:bg-[#D5BA98]/10">{t("exportExcel")}</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </ALCard>
    );
}