"use client";

import React, { useEffect, useState } from "react";
import {
    X,
    UserRound,
    ShoppingBag,
    Banknote,
    Award,
    PieChart as PieChartIcon,
    ReceiptText,
    TrendingUp
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import Link from "next/link";
import { customerReportService } from "@/features/staff/report-management/customer/services/customer-service";
import { CustomerProfileDetailDto } from "@/features/staff/report-management/customer/types/customer-report-types";
import { useCustomerReport } from "@/features/staff/report-management/customer/hooks/use-customer-report";

interface CustomerDetailDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    customerId: string | null;
    customerName: string | null;
}

export function CustomerDetailDrawer({ isOpen, onClose, customerId, customerName }: CustomerDetailDrawerProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [profileData, setProfileData] = useState<CustomerProfileDetailDto | null>(null);

    // Lấy filter hiện tại (startDate, endDate) từ hook cha để truyền xuống API Profile
    const { filters } = useCustomerReport();

    useEffect(() => {
        if (isOpen && customerId) {
            const fetchProfile = async () => {
                setIsLoading(true);
                try {
                    // GỌI API THẬT THÔNG QUA SERVICE
                    const data = await customerReportService.getCustomerProfileDetail(customerId, {
                        startDate: filters.startDate,
                        endDate: filters.endDate
                    });

                    setProfileData(data);
                } catch (error) {
                    console.error("Failed to fetch customer profile:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchProfile();
        } else {
            // Khi đóng Drawer thì clear data để lần sau mở không bị giật lag
            setProfileData(null);
        }
    }, [isOpen, customerId, filters.startDate, filters.endDate]);

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
                        <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0">
                            <UserRound size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 font-mono tracking-wider">CUSTOMER #{customerId?.padStart(5, '0')}</p>
                            <h2 className="text-lg font-extrabold text-[#1A3A52] leading-tight">{customerName || "Guest"}</h2>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 -mr-2 -mt-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors shrink-0">
                        <X size={20} />
                    </button>
                </div>

                {isLoading || !profileData ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A3A52]"></div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">

                        {/* 4 KPI Cards */}
                        <div className="grid grid-cols-2 gap-3 mb-8">
                            <div className="bg-white border border-[#D5BA98]/40 p-4 rounded-2xl shadow-sm">
                                <div className="flex items-center gap-1.5 mb-1 text-emerald-600">
                                    <Banknote size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Total Spent</span>
                                </div>
                                <span className="text-xl font-extrabold text-[#1A3A52]">{formatCurrency(profileData.totalSpent)}</span>
                            </div>
                            <div className="bg-white border border-[#D5BA98]/40 p-4 rounded-2xl shadow-sm">
                                <div className="flex items-center gap-1.5 mb-1 text-blue-500">
                                    <ShoppingBag size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Total Orders</span>
                                </div>
                                <span className="text-xl font-extrabold text-[#1A3A52]">{profileData.totalOrders}</span>
                            </div>
                            <div className="bg-white border border-[#D5BA98]/40 p-4 rounded-2xl shadow-sm">
                                <div className="flex items-center gap-1.5 mb-1 text-purple-500">
                                    <TrendingUp size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Avg Order Value</span>
                                </div>
                                <span className="text-xl font-extrabold text-[#1A3A52]">{formatCurrency(profileData.avgOrder)}</span>
                            </div>
                            <div className="bg-gradient-to-br from-[#1A3A52] to-[#254f6e] border border-[#1A3A52] p-4 rounded-2xl shadow-sm">
                                <div className="flex items-center gap-1.5 mb-1 text-[#C5A059]">
                                    <Award size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Loyalty Points</span>
                                </div>
                                <span className="text-xl font-extrabold text-white">{profileData.points} <span className="text-sm font-medium text-slate-300">pts</span></span>
                            </div>
                        </div>

                        {/* Donut Chart: Category Preferences */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <PieChartIcon size={18} className="text-[#C5A059]" />
                                    <h3 className="text-sm font-bold text-[#1A3A52] uppercase tracking-wide">Purchase Preferences</h3>
                                </div>
                            </div>
                            <div className="h-[260px] w-full bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center">
                                {profileData.preferences && profileData.preferences.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={profileData.preferences}
                                                cx="50%"
                                                cy="45%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {profileData.preferences.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                                                formatter={(value: any) => [`${value}%`, 'Share']}
                                            />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b' }}/>
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-sm text-slate-400 font-medium">No preference data available.</p>
                                )}
                            </div>
                        </div>

                        {/* Recent Orders of Customer */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <ReceiptText size={18} className="text-[#C5A059]" />
                                <h3 className="text-sm font-bold text-[#1A3A52] uppercase tracking-wide">Recent Orders</h3>
                            </div>
                            <div className="space-y-3">
                                {profileData.recentOrders && profileData.recentOrders.length > 0 ? (
                                    profileData.recentOrders.map((order, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-[#D5BA98]/60 hover:shadow-md transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-500">
                                                    {order.id}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-[#1A3A52]">{order.time}</p>
                                                    <p className="text-xs font-medium text-slate-400">{order.amount > 0 ? "Paid" : "N/A"}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-extrabold text-emerald-600">{formatCurrency(order.amount)}</p>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{order.status}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-400 text-center py-4">No recent orders found.</p>
                                )}
                            </div>

                            <Link href="/dashboard/orders">
                                <button className="w-full mt-4 py-3 rounded-xl border-2 border-dashed border-slate-200 text-sm font-bold text-slate-500 hover:border-[#1A3A52] hover:text-[#1A3A52] transition-colors">
                                    View full history
                                </button>
                            </Link>
                        </div>

                    </div>
                )}
            </div>
        </>
    );
}