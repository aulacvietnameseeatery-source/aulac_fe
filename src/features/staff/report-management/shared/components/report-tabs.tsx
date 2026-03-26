"use client";
import React from "react";
import { DollarSign, ListTodo, ShoppingBag, Users, Hourglass } from "lucide-react";
import { Link } from "@/routing"

interface ReportTabsProps {
    activeTab: string;
}

export function ReportTabs({ activeTab }: ReportTabsProps) {
    const tabs = [
        { name: "Earning Report", icon: DollarSign, href: "/dashboard/reports" },
        { name: "Order Report", icon: ListTodo, href: "/dashboard/reports/order" },
        { name: "Sales Report", icon: ShoppingBag, href: "/dashboard/reports/sales" },
        { name: "Customer Report", icon: Users, href: "/dashboard/reports/customer" },
        { name: "Audit Logs", icon: Hourglass, href: "/dashboard/reports/audit" },
    ];

    return (
        <ul className="flex flex-wrap border-b border-gray-200 mb-6">
            {tabs.map((tab, idx) => {
                const isActive = tab.name === activeTab;

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