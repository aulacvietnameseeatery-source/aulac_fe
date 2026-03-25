"use client";
import React from "react";
import { Search } from "lucide-react";
import { OrderReportRecordDto } from "../types/order-report-types";

interface OrderTableProps {
    data: OrderReportRecordDto[];
    isLoading: boolean;
}

export function OrderTable({ data, isLoading }: OrderTableProps) {
    return (
        <div>
            {/* Table Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="relative w-full sm:w-64">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search size={16} className="text-gray-400" />
                    </span>
                    <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none bg-gray-50/50" />
                </div>
                <div className="flex items-center gap-2">
                    <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none">
                        <option>Sort by : Newest</option>
                        <option>Oldest</option>
                        <option>Ascending</option>
                        <option>Descending</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm text-left text-gray-600 whitespace-nowrap">
                    <thead className="text-xs text-gray-700 bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-4 py-3 font-semibold">Order ID</th>
                        <th className="px-4 py-3 font-semibold">Date</th>
                        <th className="px-4 py-3 font-semibold">Customer</th>
                        <th className="px-4 py-3 font-semibold">Token No</th>
                        <th className="px-4 py-3 font-semibold">Type</th>
                        <th className="px-4 py-3 font-semibold">Menus</th>
                        <th className="px-4 py-3 font-semibold">Grand Total</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    {isLoading ? (
                        <tr><td colSpan={8} className="text-center py-8">Loading...</td></tr>
                    ) : data.length === 0 ? (
                        <tr><td colSpan={8} className="text-center py-8">No results found</td></tr>
                    ) : (
                        data.map((row, idx) => (
                            <tr key={idx} className="bg-white border-b border-gray-100 hover:bg-gray-50">
                                <td className="px-4 py-3 text-blue-600 font-medium">{row.orderId}</td>
                                <td className="px-4 py-3">{row.date}</td>
                                <td className="px-4 py-3 text-gray-800">{row.customerName}</td>
                                <td className="px-4 py-3">{row.tokenNo}</td>
                                <td className="px-4 py-3">{row.orderType}</td>
                                <td className="px-4 py-3">{row.menusCount}</td>
                                <td className="px-4 py-3 font-semibold text-gray-900">${row.grandTotal.toFixed(2)}</td>
                                <td className="px-4 py-3">
                                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded text-[11px] font-semibold border border-emerald-100">
                                            {row.status}
                                        </span>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}