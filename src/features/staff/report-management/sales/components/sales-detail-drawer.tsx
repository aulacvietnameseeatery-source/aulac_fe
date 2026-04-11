"use client";

import React, { useEffect, useState } from "react";
import { X, TrendingUp, ShoppingBag, Utensils, Activity, Link as LinkIcon } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// IMPORT TỪ FILE CỦA BẠN
import { salesReportService } from "@/features/staff/report-management/sales/services/sales-report.service";
import { ItemDetailData } from "@/features/staff/report-management/sales/types/sales-report-types";
import { useSalesReport } from "@/features/staff/report-management/sales/hooks/use-sales-report";

interface SalesDetailDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    dishId: string | null;
    dishName: string | null;
}

export function SalesDetailDrawer({ isOpen, onClose, dishId, dishName }: SalesDetailDrawerProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [detailData, setDetailData] = useState<ItemDetailData | null>(null);

    const { filters } = useSalesReport();

    useEffect(() => {
        if (isOpen && dishId) {
            const fetchDetail = async () => {
                setIsLoading(true);
                try {
                    const data = await salesReportService.getDishPerformanceDetail(dishId, {
                        startDate: filters.startDate,
                        endDate: filters.endDate
                    });
                    setDetailData(data);
                } catch (error) {
                    console.error("Failed to fetch dish performance details:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchDetail();
        } else {
            setDetailData(null);
        }
    }, [isOpen, dishId, filters.startDate, filters.endDate]);

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
                <div className="flex items-start justify-between px-6 py-5 border-b border-[#D5BA98]/30 bg-white">
                    <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                            <Utensils size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 font-mono tracking-wider">ITEM #{dishId}</p>
                            <h2 className="text-lg font-extrabold text-[#1A3A52] leading-tight pr-4">{dishName}</h2>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 -mr-2 -mt-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors shrink-0">
                        <X size={20} />
                    </button>
                </div>

                {isLoading || !detailData ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A3A52]"></div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">

                        {/* 3 KPI Cards */}
                        <div className="grid grid-cols-3 gap-3 mb-8">
                            <div className="bg-white border border-[#D5BA98]/40 p-3 rounded-2xl shadow-sm">
                                <div className="flex items-center gap-1.5 mb-1.5 text-emerald-600">
                                    <TrendingUp size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Revenue</span>
                                </div>
                                <span className="text-lg font-extrabold text-[#1A3A52]">{formatCurrency(detailData.totalRevenue)}</span>
                            </div>
                            <div className="bg-white border border-[#D5BA98]/40 p-3 rounded-2xl shadow-sm">
                                <div className="flex items-center gap-1.5 mb-1.5 text-blue-500">
                                    <ShoppingBag size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Units Sold</span>
                                </div>
                                <span className="text-lg font-extrabold text-[#1A3A52]">{detailData.totalSold}</span>
                            </div>
                            <div className="bg-white border border-[#D5BA98]/40 p-3 rounded-2xl shadow-sm">
                                <div className="flex items-center gap-1.5 mb-1.5 text-purple-500">
                                    <Activity size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Daily Avg</span>
                                </div>
                                <span className="text-lg font-extrabold text-[#1A3A52]">{detailData.avgDailySold}</span>
                            </div>
                        </div>

                        {/* Line Chart Area */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-[#1A3A52] uppercase tracking-wide">Sales Trend</h3>
                                <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Selected Period</span>
                            </div>
                            <div className="h-[220px] w-full bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center">
                                {detailData.trend && detailData.trend.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={detailData.trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                            <Tooltip
                                                cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                                                formatter={(value: any) => [`${value} items`, 'Sold']}
                                                labelStyle={{ color: '#64748b', fontWeight: 'bold', marginBottom: '4px' }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="quantity"
                                                stroke="#f97316"
                                                strokeWidth={3}
                                                dot={{ r: 4, fill: '#fff', stroke: '#f97316', strokeWidth: 2 }}
                                                activeDot={{ r: 6, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-sm text-slate-400 font-medium">No sales data in this period.</p>
                                )}
                            </div>
                        </div>

                        {/* Frequently Bought With (Cross-Sell Insights) */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <LinkIcon size={18} className="text-[#C5A059]" />
                                <h3 className="text-sm font-bold text-[#1A3A52] uppercase tracking-wide">Frequently Bought With</h3>
                            </div>
                            <div className="space-y-3">
                                {detailData.frequentlyBoughtWith && detailData.frequentlyBoughtWith.length > 0 ? (
                                    detailData.frequentlyBoughtWith.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-xs border border-slate-100">
                                                    #{i + 1}
                                                </div>
                                                <p className="text-sm font-bold text-[#1A3A52] line-clamp-1 pr-4">{item.name}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-xs font-extrabold text-blue-600">{item.frequency} times</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-400 text-center py-4">Not enough data to analyze yet.</p>
                                )}
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </>
    );
}