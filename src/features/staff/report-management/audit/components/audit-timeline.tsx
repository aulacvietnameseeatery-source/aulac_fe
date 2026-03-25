"use client";
import React from "react";
import { BadgeDollarSign, Box, UserRound, PercentDiamond, Trash2, BadgeX, LogIn } from "lucide-react";

export function AuditTimeline() {
    // Dữ liệu mẫu Timeline dựa trên file HTML gốc
    const logs = [
        { title: "Sale Created by David Williams (Cashier) at POS Terminal", time: "12 Nov 2025 at 09:45 AM", icon: BadgeDollarSign },
        { title: "Product Updated by Emily Johnson (Supervisor) in Inventory", time: "12 Nov 2025 at 10:15 AM", icon: Box },
        { title: "User Added by John Smith (Admin) in Settings", time: "12 Nov 2025 at 11:00 AM", icon: UserRound },
        { title: "Discount Applied by Alex Martinez (Cashier) in POS Terminal", time: "12 Nov 2025 at 11:25 AM", icon: PercentDiamond },
        { title: "Product Deleted by Emily Johnson (Supervisor) in Inventory", time: "12 Nov 2025 at 12:20 PM", icon: Trash2 },
        { title: "Sale Voided by Alex Martinez (Cashier) at POS Terminal", time: "12 Nov 2025 at 01:45 PM", icon: BadgeX },
        { title: "Refund Issued by Emily Johnson (Supervisor) in Sales", time: "12 Nov 2025 at 02:00 PM", icon: BadgeDollarSign },
        { title: "Login Attempt (Failed) by John Smith (Admin) at Dashboard", time: "12 Nov 2025 at 02:20 PM", icon: LogIn },
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h5 className="font-semibold text-gray-800 mb-6">Activity Timeline</h5>
            <div className="relative border-l border-gray-200 ml-4 space-y-8">
                {logs.map((log, idx) => (
                    <div key={idx} className="relative pl-8">
                        <span className="absolute -left-[18px] top-1 bg-white border border-gray-200 w-9 h-9 rounded-full flex items-center justify-center text-gray-500 shadow-sm">
                            <log.icon size={16} />
                        </span>
                        <div>
                            <p className="font-medium text-gray-800 mb-1">{log.title}</p>
                            <span className="text-sm text-gray-500">{log.time}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}