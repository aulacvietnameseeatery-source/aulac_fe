"use client";
import React from "react";
import { DollarSign, ListTodo, ShoppingBag, Users } from "lucide-react";
import { Link } from "@/routing";
import { useTranslations } from "next-intl";
import { ALCard } from "@/components/ui/al-card";

interface ReportTabsProps {
    activeTab: string;
}

export function ReportTabs({ activeTab }: ReportTabsProps) {
    const t = useTranslations("reports.tabs");

    const tabs = [
        { id: "Earning Report", name: t("earning"), icon: DollarSign, href: "/dashboard/reports" },
        { id: "Order Report", name: t("order"), icon: ListTodo, href: "/dashboard/reports/order" },
        { id: "Sales Report", name: t("sales"), icon: ShoppingBag, href: "/dashboard/reports/sales" },
        { id: "Customer Report", name: t("customer"), icon: Users, href: "/dashboard/reports/customer" },
    ];

    return (
        <ALCard padding="sm" variant="default" elevation="sm" className="py-2">
            <ul className="flex flex-wrap gap-1">
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
                                {tab.name}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </ALCard>
    );
}