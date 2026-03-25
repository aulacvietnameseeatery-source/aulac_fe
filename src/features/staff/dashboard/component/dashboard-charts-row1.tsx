"use client";
import React from "react";
import { CircleDollarSign, TrendingUp, Donut, MoreVertical } from "lucide-react";

export function DashboardChartsRow1() {
    const topItems = [
        { rank: 2, name: "Chicken Taco", orders: 250, percent: 85, color: "bg-blue-600" },
        { rank: 3, name: "Grilled Chicken", orders: 175, percent: 70, color: "bg-gray-600" },
        { rank: 4, name: "Lemon Mint Juice", orders: 160, percent: 55, color: "bg-emerald-500" },
        { rank: 5, name: "Chicken Taco", orders: 120, percent: 35, color: "bg-purple-500" },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Revenue Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded border flex items-center justify-center bg-white text-gray-700"><CircleDollarSign size={16} /></div>
                        <h5 className="font-semibold text-gray-800 m-0">Total Revenue</h5>
                    </div>
                    <select className="text-sm border border-gray-200 rounded px-2 py-1 outline-none"><option>Weekly</option><option>Monthly</option><option>Yearly</option></select>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center text-blue-600"><TrendingUp size={20} /></div>
                            <div><p className="text-sm text-gray-500 mb-0">Total Revenue</p><h4 className="text-xl font-bold text-gray-800 mb-0">$3,989</h4></div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500"><span className="w-3 h-3 rounded bg-blue-600"></span> Revenue</div>
                    </div>
                    <div className="flex-1 min-h-[250px] bg-gray-50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center">
                        <p className="text-gray-400">[ ApexChart: Revenue ]</p>
                    </div>
                </div>
            </div>

            {/* Top Selling Item */}
            <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded border flex items-center justify-center bg-white text-gray-700"><Donut size={16} /></div>
                        <h5 className="font-semibold text-gray-800 m-0">Top Selling Item</h5>
                    </div>
                    <MoreVertical size={18} className="text-gray-400 cursor-pointer" />
                </div>
                <div className="p-5 flex flex-col gap-4">
                    <div className="bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-lg text-sm font-medium">✨ Most Ordered : Veggie Supreme Pizza</div>
                    <div className="flex items-center border border-gray-100 rounded-lg p-3 shadow-sm">
                        <div className="w-12 h-12 bg-orange-100 rounded mr-3"></div>
                        <div>
                            <h6 className="text-sm font-bold text-gray-800 mb-0.5">Veggie Supreme Pizza</h6>
                            <p className="text-xs text-gray-500 mb-0">No of Orders : 520</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 mt-2">
                        {topItems.map((item) => (
                            <div key={item.rank} className="flex items-center justify-between">
                                <h6 className="text-sm font-semibold text-gray-700 mb-0"><span className="text-gray-400 mr-1">#{item.rank}</span> {item.name}</h6>
                                <div className="flex items-center gap-3 w-1/2">
                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color}`} style={{ width: `${item.percent}%` }}></div>
                                    </div>
                                    <span className="text-sm font-bold text-gray-700 w-8 text-right">{item.orders}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}