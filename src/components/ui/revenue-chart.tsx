"use client";

import React from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import { useTranslations, useFormatter } from "next-intl";

interface ChartData {
    date: string;
    revenue: number;
    orders: number;
}

interface RevenueChartProps {
    data: ChartData[];
    height?: number | string;
}

export function RevenueChart({ data, height = 350 }: RevenueChartProps) {
    const t = useTranslations("dashboard");
    const format = useFormatter();

    // Format tiền tệ đầy đủ cho Tooltip (VD: CHF 140.44)
    const formatCurrency = (value: number) => {
        return format.number(value, { style: 'currency', currency: 'CHF' });
    };

    // Format số rút gọn cho trục Y cho đỡ rối mắt (VD: 140)
    const formatCompactNumber = (value: number) => {
        return format.number(value, { notation: 'compact' });
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border border-gray-100 p-3 rounded-lg shadow-xl">
                    <p className="text-sm font-semibold text-gray-800 mb-1">{label}</p>
                    <div className="flex flex-col gap-1">
                        <p className="text-xs font-medium text-emerald-600">
                            Doanh thu: <span className="font-bold">{formatCurrency(payload[0].value)}</span>
                        </p>
                        <p className="text-xs font-medium text-blue-600">
                            Số đơn: <span className="font-bold">{payload[0].payload.orders}</span>
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    if (!data || data.length === 0) {
        return (
            <div style={{ height }} className="w-full flex items-center justify-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <p className="text-sm text-gray-400">Không có dữ liệu doanh thu</p>
            </div>
        );
    }

    return (
        <div style={{ height }} className="w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    // Đã trả margin left về 0 để không bị cắt chữ
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FFAB2D" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#FFAB2D" stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />

                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        tickFormatter={(val) => {
                            const d = new Date(val);
                            return isNaN(d.getTime()) ? val : `${d.getDate()}/${d.getMonth() + 1}`;
                        }}
                    />

                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        width={50} // Mở rộng không gian trục Y để số không bị dính vào viền
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                        tickFormatter={(val) => formatCompactNumber(val)}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#FFAB2D"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        activeDot={{ r: 6, fill: "#1A3A51", stroke: "#FFAB2D", strokeWidth: 2 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}