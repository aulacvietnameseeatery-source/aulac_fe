"use client";
import React from "react";
import { Box, DollarSign, Percent, CalendarDays, TrendingUp, TrendingDown } from "lucide-react";

export function DashboardStats() {
    const stats = [
        { title: "Total Orders", value: "6,986", trend: "+12.5%", isUp: true, icon: Box, color: "purple" },
        { title: "Total Sales", value: "$7,516", trend: "+12.5%", isUp: true, icon: DollarSign, color: "blue" },
        { title: "Average Value", value: "$25.36", trend: "-8.5%", isUp: false, icon: Percent, color: "orange" },
        { title: "Reservations", value: "496", trend: "+12.5%", isUp: true, icon: CalendarDays, color: "emerald" },
    ];

    const colors: Record<string, string> = {
        purple: "bg-purple-50 border-purple-500 text-purple-600",
        blue: "bg-blue-50 border-blue-500 text-blue-600",
        orange: "bg-orange-50 border-orange-500 text-orange-600",
        emerald: "bg-emerald-50 border-emerald-500 text-emerald-600"
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
            {stats.map((stat, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative overflow-hidden">
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <h4 className="flex items-center text-2xl font-bold text-gray-800 mb-1">
                                {stat.value}
                                <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${stat.isUp ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {stat.isUp ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />} {stat.trend}
                </span>
                            </h4>
                            <p className="text-sm font-medium text-gray-500 m-0">{stat.title}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-r-2 ${colors[stat.color]}`}>
                            <stat.icon size={24} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}