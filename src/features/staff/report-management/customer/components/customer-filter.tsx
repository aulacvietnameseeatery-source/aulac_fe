"use client";
import React, { useState } from "react";
import { Calendar, Search } from "lucide-react";

export function CustomerFilter() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 border-b border-gray-100 pb-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date*</label>
                <div className="relative"><input type="date" className="w-full pl-3 pr-10 py-2 border rounded-lg text-sm" /><Calendar size={16} className="absolute right-3 top-2.5 text-gray-400" /></div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date*</label>
                <div className="relative"><input type="date" className="w-full pl-3 pr-10 py-2 border rounded-lg text-sm" /><Calendar size={16} className="absolute right-3 top-2.5 text-gray-400" /></div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer*</label>
                <div className="relative">
                    <button onClick={() => setIsOpen(!isOpen)} className="w-full bg-white px-3 py-2 border rounded-lg text-sm text-left">Select</button>
                    {isOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg p-3">
                            <h6 className="text-sm font-semibold mb-3">Customer</h6>
                            <div className="relative mb-3"><Search size={14} className="absolute left-3 top-2.5 text-gray-400" /><input type="text" placeholder="Search" className="w-full pl-8 py-1.5 border rounded text-sm" /></div>
                            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                                {["Walk-in Customer", "Sue Allen", "Frank Barrett"].map((n, i) => (<label key={i} className="flex items-center text-sm cursor-pointer"><input type="checkbox" className="mr-2 rounded" />{n}</label>))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-end"><button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg text-sm">Submit</button></div>
        </div>
    );
}