"use client";
import React, { useState } from "react";
import { Calendar, Search } from "lucide-react";

export function SalesFilter() {
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 border-b border-gray-100 pb-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date<span className="text-red-500 ms-1">*</span></label>
                <div className="relative">
                    <input type="date" className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    <Calendar size={16} className="absolute right-3 top-2.5 text-gray-400" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date<span className="text-red-500 ms-1">*</span></label>
                <div className="relative">
                    <input type="date" className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    <Calendar size={16} className="absolute right-3 top-2.5 text-gray-400" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category<span className="text-red-500 ms-1">*</span></label>
                <div className="relative">
                    <button onClick={() => setIsCategoryOpen(!isCategoryOpen)} className="w-full bg-white px-3 py-2 border border-gray-300 rounded-lg text-sm text-left flex justify-between items-center focus:outline-none">
                        Select
                    </button>
                    {isCategoryOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                            <h6 className="text-sm font-semibold mb-3">Category</h6>
                            <div className="relative mb-3">
                                <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                                <input type="text" placeholder="Search" className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded text-sm outline-none" />
                            </div>
                            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                                {["Sea Food", "Pizza", "Salads", "Tacos", "Burgers", "Ice Cream"].map((name, idx) => (
                                    <label key={idx} className="flex items-center text-sm cursor-pointer">
                                        <input type="checkbox" className="mr-2 rounded border-gray-300" /> {name}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-end">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors text-sm">
                    Submit
                </button>
            </div>
        </div>
    );
}