"use client";
import React from "react";
import { BookText, Users } from "lucide-react";

export function DashboardTrendingRow() {
    const menus = [
        { name: "Grilled Chicken", orders: 48, type: "Non Veg", color: "text-rose-500" },
        { name: "Grilled Veggie", orders: 99, type: "Non Veg", color: "text-rose-500" },
        { name: "Chicken Noodle", orders: 59, type: "Non Veg", color: "text-rose-500" },
        { name: "Corn Pizza", orders: 69, type: "Veg", color: "text-emerald-500" },
        { name: "Pumpkin Soup", orders: 78, type: "Veg", color: "text-emerald-500" },
        { name: "Hot Chocolate", orders: 99, type: "Veg", color: "text-emerald-500" },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Trending Menus */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                    <div className="flex items-center gap-2"><BookText size={18} className="text-gray-700" /><h5 className="font-semibold text-gray-800 m-0">Trending Menus</h5></div>
                    <select className="text-sm border rounded px-2 py-1 outline-none"><option>All Items</option></select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {menus.map((menu, i) => (
                        <div key={i} className="border border-gray-100 rounded-lg p-3">
                            <div className="h-32 bg-gray-100 rounded mb-3"></div> {/* Placeholder Ảnh */}
                            <h6 className="text-sm font-bold text-gray-800 mb-1">{menu.name}</h6>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">Orders: {menu.orders}</span>
                                <span className={`${menu.color} font-medium flex items-center`}><span className="w-1.5 h-1.5 rounded-full bg-current mr-1"></span>{menu.type}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* User Statistics */}
            <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                    <div className="flex items-center gap-2"><Users size={18} className="text-gray-700" /><h5 className="font-semibold text-gray-800 m-0">User Statistics</h5></div>
                    <select className="text-sm border rounded px-2 py-1 outline-none"><option>Weekly</option></select>
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                        <div><p className="text-xs text-gray-500 mb-0">Top User</p><h6 className="text-sm font-bold mb-0">Andrew Jessica</h6></div>
                    </div>
                    <div className="text-right"><p className="text-xs text-gray-500 mb-0">Grand Total</p><h6 className="text-sm font-bold mb-0">$800</h6></div>
                </div>
                <div className="flex items-center justify-between mb-4">
                    <div><p className="text-xs text-gray-500 mb-0">Total New Users</p><h6 className="text-sm font-bold mb-0">986 <span className="text-[10px] text-emerald-600 ml-1">+12.6%</span></h6></div>
                    <div className="flex -space-x-2">
                        {[1, 2, 3, 4].map(i => <div key={i} className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>)}
                    </div>
                </div>
                <div className="flex-1 min-h-[150px] bg-gray-50 rounded border border-dashed flex items-center justify-center"><p className="text-gray-400">[ ApexChart: Users ]</p></div>
            </div>
        </div>
    );
}