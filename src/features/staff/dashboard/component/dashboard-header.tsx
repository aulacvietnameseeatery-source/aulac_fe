"use client";
import React from "react";
import { RefreshCcw, FolderSync, Upload, Calendar as CalendarIcon } from "lucide-react";

export function DashboardHeader() {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold text-gray-800 m-0">Dashboard</h3>
                <button className="p-1.5 bg-white border border-gray-200 rounded-full text-gray-500 hover:bg-gray-50 transition-colors shadow-sm">
                    <RefreshCcw size={16} />
                </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <button className="inline-flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
                    <FolderSync size={16} className="mr-2 text-gray-500" /> Sync Data
                </button>
                <button className="inline-flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
                    <Upload size={16} className="mr-2 text-gray-500" /> Export
                </button>
                <div className="inline-flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm">
                    <CalendarIcon size={16} className="mr-2 text-gray-500" />
                    <span>Oct 24, 2025 - Nov 24, 2025</span>
                </div>
            </div>
        </div>
    );
}