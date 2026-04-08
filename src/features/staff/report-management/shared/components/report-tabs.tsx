"use client";
import React from "react";
import { DollarSign, ListTodo, ShoppingBag, Users, Upload } from "lucide-react";
import { Link } from "@/routing";
import { useTranslations } from "next-intl";
import { ALCard } from "@/components/ui/al-card";

interface ReportTabsProps {
    activeTab: string;
}

export function ReportTabs({ activeTab }: ReportTabsProps) {
    const t = useTranslations("reports.tabs");
    const tHeader = useTranslations("reports.header");

    const tabs = [
        { id: "Earning Report", name: t("earning"), icon: DollarSign, href: "/dashboard/reports" },
        { id: "Order Report", name: t("order"), icon: ListTodo, href: "/dashboard/reports/order" },
        { id: "Sales Report", name: t("sales"), icon: ShoppingBag, href: "/dashboard/reports/sales" },
        { id: "Customer Report", name: t("customer"), icon: Users, href: "/dashboard/reports/customer" },
    ];

    return (
        <ALCard padding="sm" variant="default" elevation="sm" className="py-2">
            <div className="flex items-center justify-between gap-2">
                <ul className="flex flex-wrap gap-1 min-w-0">
                    {tabs.map((tab, idx) => {
                        const isActive = tab.id === activeTab;

                        return (
                            <li key={idx}>
                                <Link
                                    href={tab.href}
                                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                                        isActive
                                            ? 'bg-[#1A3A52] text-white shadow-sm'
                                            : 'text-[#1A3A52]/60 hover:bg-[#D5BA98]/10 hover:text-[#1A3A52]'
                                    }`}
                                >
                                    <tab.icon size={14} />
                                    <span className="hidden sm:inline">{tab.name}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                <div className="relative group shrink-0">
                    <button className="inline-flex items-center px-3 py-1.5 rounded-lg border border-[#D5BA98]/60 bg-white text-xs font-medium text-[#1A3A52] hover:bg-[#D5BA98]/10 transition-colors shadow-sm">
                        <Upload size={14} className="sm:mr-2" />
                        <span className="hidden sm:inline">{tHeader("export")}</span>
                    </button>
                    <div className="absolute right-0 mt-1 w-40 rounded-lg border border-[#D5BA98]/40 bg-white shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        <ul className="py-1 text-xs text-[#1A3A52]/80">
                            <li><a href="#" className="block px-4 py-2 hover:bg-[#D5BA98]/10">{tHeader("exportPdf")}</a></li>
                            <li><a href="#" className="block px-4 py-2 hover:bg-[#D5BA98]/10">{tHeader("exportExcel")}</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </ALCard>
    );
}