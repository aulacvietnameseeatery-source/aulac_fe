"use client";
import React from "react";
import { RefreshCcw, Upload } from "lucide-react";
import { useTranslations } from "next-intl";

export function ReportHeader({ onRefresh }: { onRefresh: () => void }) {
    const t = useTranslations("reports.header");

    return (
        <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-3 mb-4 flex justify-between">
            <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold text-gray-800 m-0">{t("title")}</h3>
                <button onClick={onRefresh} className="p-1.5 bg-white border border-gray-200 rounded-full text-gray-500 hover:bg-gray-50 transition-colors shadow-sm">
                    <RefreshCcw size={16} />
                </button>
            </div>
            <div className="relative group">
                <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
                    <Upload size={16} className="mr-2" /> {t("export")}
                </button>
                <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-100 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <ul className="py-1 text-sm text-gray-700">
                        <li><a href="#" className="block px-4 py-2 hover:bg-gray-50">{t("exportPdf")}</a></li>
                        <li><a href="#" className="block px-4 py-2 hover:bg-gray-50">{t("exportExcel")}</a></li>
                    </ul>
                </div>
            </div>
        </div>
    );
}