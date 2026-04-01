"use client";
import React from "react";
import { DollarSign, ListTodo, ShoppingBag, Users, Hourglass } from "lucide-react";
import { Link } from "@/routing"
import { useTranslations } from "next-intl";

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
        <ul className="flex flex-wrap border-b border-gray-200 mb-6">
            {tabs.map((tab, idx) => {
                const isActive = tab.id === activeTab;

                return (
                    <li key={idx} className="mr-2">
                        <Link
                            href={tab.href}
                            className={`inline-flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                isActive
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <tab.icon size={16} className="mr-2" />
                            {tab.name}
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}