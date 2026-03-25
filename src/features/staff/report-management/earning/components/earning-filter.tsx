"use client";
import React from "react";
import { Calendar, Search } from "lucide-react";

export function EarningFilter() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 border-b border-gray-100 pb-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date <span className="text-red-500">*</span></label>
                <div className="relative">
                    <input type="date" className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    <Calendar size={16} className="absolute right-3 top-2.5 text-gray-400" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date <span className="text-red-500">*</span></label>
                <div className="relative">
                    <input type="date" className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    <Calendar size={16} className="absolute right-3 top-2.5 text-gray-400" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer <span className="text-red-500">*</span></label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white">
                    <option>Select Customer</option>
                    <option>Walk-in Customer</option>
                    <option>Sue Allen</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method <span className="text-red-500">*</span></label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white">
                    <option>Select Method</option>
                    <option>Credit Card</option>
                    <option>Cash</option>
                    <option>PayPal</option>
                </select>
            </div>

            <div className="flex items-end">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                    Submit
                </button>
            </div>
        </div>
    );
}