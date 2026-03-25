"use client";
import React from "react";
import { Search, UserRound } from "lucide-react";
import { CustomerReportRecordDto } from "../types/customer-report-types";

export function CustomerTable({ data, isLoading }: { data: CustomerReportRecordDto[], isLoading: boolean }) {
    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="relative w-full sm:w-64">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3"><Search size={16} className="text-gray-400" /></span>
                    <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50/50" />
                </div>
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none">
                    <option>Sort by : Newest</option><option>Oldest</option>
                </select>
            </div>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm text-left text-gray-600 whitespace-nowrap">
                    <thead className="text-xs text-gray-700 bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-4 py-3 font-semibold">Customer ID</th>
                        <th className="px-4 py-3 font-semibold">Customer</th>
                        <th className="px-4 py-3 font-semibold">Total Orders</th>
                        <th className="px-4 py-3 font-semibold">Grand Total</th>
                    </tr>
                    </thead>
                    <tbody>
                    {isLoading ? (<tr><td colSpan={4} className="text-center py-8">Loading...</td></tr>) :
                        data.map((row, idx) => (
                            <tr key={idx} className="bg-white border-b border-gray-100 hover:bg-gray-50">
                                <td className="px-4 py-3 text-blue-600 font-medium">{row.customerId}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 border flex items-center justify-center text-gray-500"><UserRound size={14}/></div>
                                        <span className="text-gray-800 font-medium">{row.customerName}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">{row.totalOrders}</td>
                                <td className="px-4 py-3 font-semibold text-gray-900">${row.grandTotal.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}