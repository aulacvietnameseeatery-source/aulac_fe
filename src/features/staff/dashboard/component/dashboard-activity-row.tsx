"use client";
import React from "react";
import { CalendarDays, ConciergeBell, Bell, Clock, Users, Armchair, ChefHat, ShoppingCart, DollarSign, Info, PackageOpen } from "lucide-react";

interface DashboardActivityRowProps {
    reservations?: any[];
    tables?: any[];
    notifications?: any[];
    isLoading?: boolean;
}

export function DashboardActivityRow({ reservations = [], tables = [], notifications = [], isLoading }: DashboardActivityRowProps) {

    const getResStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "completed": return "bg-emerald-100 text-emerald-700";
            case "no show": case "cancelled": return "bg-rose-100 text-rose-700";
            default: return "bg-blue-100 text-blue-700";
        }
    };

    const getNotifUI = (type: string) => {
        switch (type) {
            case "NEW_ORDER": return { icon: ChefHat, bg: "bg-orange-100 text-orange-600" };
            case "PAYMENT_COMPLETED": return { icon: DollarSign, bg: "bg-emerald-100 text-emerald-600" };
            case "INVENTORY_TX_SUBMITTED": return { icon: PackageOpen, bg: "bg-indigo-100 text-indigo-600" };
            case "TABLE_STATUS_CHANGED": return { icon: ConciergeBell, bg: "bg-blue-100 text-blue-600" };
            case "RESERVATION_STATUS_CHANGED": return { icon: CalendarDays, bg: "bg-purple-100 text-purple-600" };
            default: return { icon: Bell, bg: "bg-gray-100 text-gray-600" };
        }
    };

    const formatTimeAgo = (dateStr: string) => {
        if (!dateStr) return "";
        const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 60000);
        if (diff < 60) return `${diff} min ago`;
        return `${Math.floor(diff / 60)} hrs ago`;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Reservations */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                    <div className="flex items-center gap-2"><CalendarDays size={18} className="text-gray-700" /><h5 className="font-semibold text-gray-800 m-0">Reservations</h5></div>
                    <select className="text-sm border rounded px-2 py-1 outline-none"><option>All Orders</option></select>
                </div>
                <div className="flex flex-col gap-4 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
                    {isLoading ? <p className="text-center text-sm text-gray-500 mt-10">Loading...</p>
                        : reservations.length === 0 ? <p className="text-center text-sm text-gray-500 mt-10">No reservations</p>
                            : reservations.slice(0, 10).map((res, i) => {
                                const date = new Date(res.reservedTime);
                                return (
                                    <div key={i} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-gray-800 text-white rounded-lg p-2 text-center w-[54px] shrink-0">
                                                <p className="text-xs font-bold mb-0 leading-tight">{date.toLocaleString('en-US', { month: 'short', day: '2-digit' })}</p>
                                                <p className="text-[10px] text-gray-400 mb-0 mt-0.5">{date.getFullYear()}</p>
                                            </div>
                                            <div>
                                                <h6 className="text-sm font-semibold text-gray-800 mb-1 truncate max-w-[120px]">{res.customerName}</h6>
                                                <div className="flex items-center gap-2 text-[11px] font-medium text-gray-500">
                                                    <span className="flex items-center"><Clock size={12} className="mr-1"/> {date.getHours()}:{date.getMinutes().toString().padStart(2, '0')}</span>
                                                    <span>|</span><span className="flex items-center"><Armchair size={12} className="mr-1 truncate max-w-[50px]"/> {res.tableName || 'N/A'}</span>
                                                    <span>|</span><span className="flex items-center"><Users size={12} className="mr-1"/> {res.pax}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] px-2 py-1 rounded font-semibold ${getResStatusColor(res.statusName)}`}>{res.statusName}</span>
                                    </div>
                                );
                            })}
                </div>
            </div>

            {/* Tables Available */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                    <div className="flex items-center gap-2"><ConciergeBell size={18} className="text-gray-700" /><h5 className="font-semibold text-gray-800 m-0">Tables Available</h5></div>
                    <button className="text-sm bg-white border rounded px-2 py-1 hover:bg-gray-50">View All</button>
                </div>
                <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[350px] pr-1 custom-scrollbar">
                    {isLoading ? <p className="col-span-2 text-center text-sm text-gray-500 mt-10">Loading...</p>
                        : tables.length === 0 ? <p className="col-span-2 text-center text-sm text-gray-500 mt-10">No tables available</p>
                            : tables.map((t, i) => (
                                <div key={i} className="border border-emerald-100 rounded-lg p-3 text-center flex flex-col items-center justify-center bg-emerald-50/50 hover:bg-emerald-50 transition-colors">
                                    <Armchair size={28} className="text-emerald-500 mb-2" />
                                    <h6 className="text-xs font-bold text-gray-800 mb-0.5">{t.tableCode}</h6>
                                    <p className="text-[10px] text-gray-500 mb-0">Capacity: {t.capacity} • {t.zone}</p>
                                </div>
                            ))}
                </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col">
                <div className="flex items-center border-b border-gray-100 pb-3 mb-4">
                    <div className="flex items-center gap-2"><Bell size={18} className="text-gray-700" /><h5 className="font-semibold text-gray-800 m-0">Notifications</h5></div>
                </div>
                <div className="flex flex-col gap-4 overflow-y-auto max-h-[350px] relative before:absolute before:inset-y-0 before:left-[1.1rem] before:w-px before:bg-gray-100 pr-2 custom-scrollbar">
                    {isLoading ? <p className="text-center text-sm text-gray-500 mt-10">Loading...</p>
                        : notifications.length === 0 ? <p className="text-center text-sm text-gray-500 mt-10">No new notifications</p>
                            : notifications.slice(0, 10).map((n, i) => {
                                const ui = getNotifUI(n.type);
                                let notifText = n.type.replace(/_/g, " ");
                                if (n.type === "NEW_ORDER") notifText = `New order at ${n.metadata?.tableCode || 'Table'}`;
                                if (n.type === "PAYMENT_COMPLETED") notifText = `Payment $${n.metadata?.amount || 0} via ${n.metadata?.method || 'Cash'}`;
                                if (n.type === "TABLE_STATUS_CHANGED") notifText = `${n.metadata?.tableCode} is ${n.metadata?.newStatus}`;

                                return (
                                    <div key={i} className="flex gap-3 relative z-10 bg-white">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 border-white shadow-sm ${ui.bg}`}><ui.icon size={14}/></div>
                                        <div className="pt-1">
                                            <p className="text-sm font-medium text-gray-800 mb-0.5 leading-tight">{notifText}</p>
                                            <p className="text-[10px] font-medium text-gray-400 flex items-center"><Clock size={10} className="mr-1"/> {formatTimeAgo(n.createdAt)}</p>
                                        </div>
                                    </div>
                                );
                            })}
                </div>
            </div>
        </div>
    );
}