"use client";
import React from "react";
import { PieChart, ShoppingCart, BarChart, CheckCircle, ShoppingBag, Wine, Utensils } from "lucide-react";

// Định nghĩa kiểu dữ liệu cho Props
interface DashboardChartsRow2Props {
    activeOrders?: any[]; // Tạm dùng any, nếu bạn đã có interface KitchenOrder thì thay vào
    isLoading?: boolean;
}

export function DashboardChartsRow2({ activeOrders = [], isLoading }: DashboardChartsRow2Props) {
    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case "PENDING": return "bg-purple-100 text-purple-700";
            case "COMPLETED": return "bg-emerald-100 text-emerald-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Category Statistics (Đợi API BE) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                    <div className="flex items-center gap-2"><PieChart size={18} className="text-gray-700" /><h5 className="font-semibold text-gray-800 m-0">Category Statistics</h5></div>
                    <select className="text-sm border rounded px-2 py-1 outline-none"><option>Weekly</option></select>
                </div>
                <div className="h-48 bg-gray-50 rounded border border-dashed flex items-center justify-center mb-4"><p className="text-gray-400">[ ApexChart: Category ]</p></div>
                <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-gray-50 pb-2"><div className="flex items-center gap-2"><div className="w-6 h-6 bg-blue-100 text-blue-600 rounded flex items-center justify-center"><ShoppingBag size={12}/></div><span className="text-sm font-medium">Take Away</span></div><span className="text-sm font-semibold">-- Orders</span></div>
                    <div className="flex justify-between items-center border-b border-gray-50 pb-2"><div className="flex items-center gap-2"><div className="w-6 h-6 bg-gray-100 text-gray-600 rounded flex items-center justify-center"><Wine size={12}/></div><span className="text-sm font-medium">Reservation</span></div><span className="text-sm font-semibold">-- Orders</span></div>
                    <div className="flex justify-between items-center"><div className="flex items-center gap-2"><div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded flex items-center justify-center"><CheckCircle size={12}/></div><span className="text-sm font-medium">Delivery</span></div><span className="text-sm font-semibold">-- Orders</span></div>
                </div>
            </div>

            {/* Active Orders (Dùng dữ liệu từ props) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                    <div className="flex items-center gap-2"><ShoppingCart size={18} className="text-gray-700" /><h5 className="font-semibold text-gray-800 m-0">Active Orders</h5></div>
                    <button className="text-sm bg-white border rounded px-2 py-1 hover:bg-gray-50">Add New</button>
                </div>
                <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                    {isLoading ? (
                        <p className="text-center text-sm text-gray-500 mt-10 animate-pulse">Loading orders...</p>
                    ) : activeOrders.length === 0 ? (
                        <p className="text-center text-sm text-gray-500 mt-10">No active orders</p>
                    ) : (
                        activeOrders.map((order: any, i: number) => {
                            const itemCount = order.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
                            return (
                                <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-orange-50 border border-orange-100 text-orange-500 flex items-center justify-center shrink-0">
                                            <Utensils size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800 mb-0.5 leading-tight">Order #{order.orderId}</p>
                                            <p className="text-xs text-gray-500 mb-0">{itemCount} items • {order.tableCode || "N/A"}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] px-2 py-1 rounded font-semibold ${getStatusColor(order.orderStatus)}`}>{order.orderStatus}</span>
                                </div>
                            );
                        })
                    )}
                </div>
                <button className="w-full mt-3 py-1.5 bg-gray-50 border border-gray-200 text-sm font-medium rounded hover:bg-gray-100 text-gray-700">View All</button>
            </div>

            {/* Sales Performance (Đợi API BE) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                    <div className="flex items-center gap-2"><BarChart size={18} className="text-gray-700" /><h5 className="font-semibold text-gray-800 m-0">Sales Performance</h5></div>
                    <button className="text-sm bg-white border rounded px-2 py-1 hover:bg-gray-50">View All</button>
                </div>
                <div className="h-40 bg-gray-50 rounded border border-dashed flex items-center justify-center mb-3"><p className="text-gray-400">[ ApexChart: Sales ]</p></div>
                <div className="flex items-center justify-between p-3 border rounded-lg bg-white mb-2 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 text-indigo-600 flex items-center justify-center rounded"><ShoppingBag size={14}/></div>
                        <div><p className="text-xs text-gray-500 mb-0">Total Orders</p><p className="text-sm font-bold mb-0">--</p></div>
                    </div>
                    <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">+-%</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 text-emerald-600 flex items-center justify-center rounded"><CheckCircle size={14}/></div>
                        <div><p className="text-xs text-gray-500 mb-0">Total Sales</p><p className="text-sm font-bold mb-0">$ --</p></div>
                    </div>
                    <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">+-%</span>
                </div>
            </div>
        </div>
    );
}