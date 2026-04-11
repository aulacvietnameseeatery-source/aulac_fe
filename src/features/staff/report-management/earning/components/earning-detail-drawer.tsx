"use client";

import React, { useEffect, useState } from "react";
import { X, TrendingUp, Clock, ReceiptText, Banknote, CalendarDays } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import Link from "next/link";

// IMPORT SERVICE VÀ DTO TỪ THƯ MỤC CỦA BẠN
import { earningReportService } from "@/features/staff/report-management/earning/services/earning-report.service";
import { DailyEarningDetailDto } from "@/features/staff/report-management/earning/types/earning-types";

interface EarningDetailDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    date: string | null;
}

export function EarningDetailDrawer({ isOpen, onClose, date }: EarningDetailDrawerProps) {
    const [isLoading, setIsLoading] = useState(false);

    // ĐỔI STATE SANG DÙNG DTO THẬT
    const [detailData, setDetailData] = useState<DailyEarningDetailDto | null>(null);

    useEffect(() => {
        if (isOpen && date) {
            const fetchDailyDetail = async () => {
                setIsLoading(true);
                try {
                    // GỌI API THẬT TỪ SERVICE
                    const data = await earningReportService.getDailyEarningDetail(date);
                    setDetailData(data);
                } catch (error) {
                    console.error("Failed to fetch daily earning detail:", error);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchDailyDetail();
        } else {
            // Xóa data cũ khi đóng Drawer
            setDetailData(null);
        }
    }, [isOpen, date]);

    const formatCurrency = (val: number) => new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(val);

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-[#1A3A52]/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
                onClick={onClose}
            />

            {/* Slide-out Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-full sm:w-[450px] md:w-[500px] bg-[#FDFBF9] shadow-[-10px_0_40px_rgba(0,0,0,0.1)] z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#D5BA98]/30 bg-white">
                    <div>
                        <h2 className="text-xl font-extrabold text-[#1A3A52]">Daily Breakdown</h2>
                        <p className="text-sm font-medium text-[#C5A059] flex items-center gap-1.5 mt-1">
                            <CalendarDays size={14} /> {date || "N/A"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {isLoading || !detailData ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A3A52]"></div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">

                        {/* KPI Cards */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-white border border-[#D5BA98]/40 p-4 rounded-2xl shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Net</span>
                                    <Banknote size={16} className="text-emerald-500" />
                                </div>
                                <span className="text-2xl font-extrabold text-[#1A3A52]">
                                    {formatCurrency(detailData.totalNet)}
                                </span>
                            </div>
                            <div className="bg-white border border-[#D5BA98]/40 p-4 rounded-2xl shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg. Order</span>
                                    <TrendingUp size={16} className="text-blue-500" />
                                </div>
                                <span className="text-2xl font-extrabold text-[#1A3A52]">
                                    {formatCurrency(detailData.avgOrder)}
                                </span>
                            </div>
                        </div>

                        {/* Chart Area */}
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <Clock size={18} className="text-[#C5A059]" />
                                <h3 className="text-sm font-bold text-[#1A3A52] uppercase tracking-wide">Hourly Revenue</h3>
                            </div>
                            <div className="h-[250px] w-full bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center">
                                {detailData.hourlyRevenue && detailData.hourlyRevenue.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={detailData.hourlyRevenue} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(val) => `${val}`} />
                                            <Tooltip
                                                cursor={{ fill: '#f8fafc' }}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                                                formatter={(value: any) => [formatCurrency(Number(value)), 'Revenue']}
                                            />
                                            <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                                                {detailData.hourlyRevenue.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.revenue > (detailData.totalNet / (detailData.hourlyRevenue.length || 1)) ? "#1A3A52" : "#C5A059"} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-sm text-slate-400 font-medium">No hourly data available.</p>
                                )}
                            </div>
                        </div>

                        {/* Recent Orders List */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <ReceiptText size={18} className="text-[#C5A059]" />
                                <h3 className="text-sm font-bold text-[#1A3A52] uppercase tracking-wide">Orders of the Day</h3>
                            </div>
                            <div className="space-y-3">
                                {detailData.recentOrders && detailData.recentOrders.length > 0 ? (
                                    detailData.recentOrders.map((order, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-[#D5BA98]/60 hover:shadow-md transition-all cursor-pointer group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-500 group-hover:bg-[#1A3A52] group-hover:text-white transition-colors">
                                                    {order.id}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-[#1A3A52]">{order.customer}</p>
                                                    <p className="text-xs font-medium text-slate-400">{order.time}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-extrabold text-emerald-600">{formatCurrency(order.amount)}</p>
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">{order.status}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-400 text-center py-4">No orders found for this day.</p>
                                )}
                            </div>

                            <Link href={`/dashboard/orders`}>
                                <button className="w-full mt-4 py-3 rounded-xl border-2 border-dashed border-slate-200 text-sm font-bold text-slate-500 hover:border-[#1A3A52] hover:text-[#1A3A52] transition-colors">
                                    View all {detailData.totalOrders} orders
                                </button>
                            </Link>
                        </div>

                    </div>
                )}
            </div>
        </>
    );
}