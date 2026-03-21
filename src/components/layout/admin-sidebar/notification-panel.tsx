"use client";

import React, { useState } from "react";
import {
    Bell,
    CookingPot,
    ShoppingCart,
    BadgeDollarSign,
    SquarePen,
    Info,
    CalendarFold,
    Clock,
    X
} from "lucide-react";
import { useTranslations } from "next-intl";

// _OLD: Legacy mock notification panel kept for visual/reference only.
// _OLD: Runtime now uses NotificationCenter from features/staff/notifications.

interface Notification {
    id: string;
    type: "order" | "kitchen" | "payment" | "created" | "stock" | "reservation";
    title: string;
    message: React.ReactNode;
    time: string;
    isRead: boolean;
    category: "unread" | "inbox" | "kitchen" | "orders";
}

const mockNotifications: Notification[] = [
    {
        id: "1",
        type: "kitchen",
        title: "New order",
        message: <>New order from <span className="text-white font-medium">Table #12</span> (3 items) pending.</>,
        time: "20 Min Ago",
        isRead: false,
        category: "kitchen"
    },
    {
        id: "2",
        type: "order",
        title: "Order confirmed",
        message: <><span className="text-white font-medium">Order #124</span> confirmed and sent to the kitchen.</>,
        time: "35 Min Ago",
        isRead: false,
        category: "orders"
    },
    {
        id: "3",
        type: "payment",
        title: "Payment received",
        message: <><span className="text-white font-medium">$850</span> received via UPI for <span className="text-white font-medium">Order #124.</span></>,
        time: "40 Min Ago",
        isRead: true,
        category: "inbox"
    },
    {
        id: "4",
        type: "created",
        title: "New order created",
        message: <>New order has been created <span className="text-white font-medium">Dine</span> in for <span className="text-white font-medium">Table 1</span> total <span className="text-white font-medium">20 Items</span></>,
        time: "45 Min Ago",
        isRead: true,
        category: "orders"
    },
    {
        id: "5",
        type: "stock",
        title: "Low stock",
        message: <>Low stock: Cheese <span className="text-white font-medium">(5 units left).</span></>,
        time: "10 Hrs Ago",
        isRead: false,
        category: "inbox"
    },
    {
        id: "6",
        type: "reservation",
        title: "Table reservation",
        message: <>Table reservation for Andrew Merkel at <span className="text-white font-medium">7:30 PM.</span></>,
        time: "40 Hrs Ago",
        isRead: true,
        category: "inbox"
    }
];

interface NotificationPanelProps {
    onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
    const t = useTranslations("Notifications");
    const [activeTab, setActiveTab] = useState<string>("all");

    const categories = ["all", "unread", "inbox", "kitchen", "orders"];

    const filteredNotifications = mockNotifications.filter(n => {
        if (activeTab === "all") return true;
        if (activeTab === "unread") return !n.isRead;
        return n.category === activeTab;
    });

    const getIcon = (type: Notification["type"]) => {
        switch (type) {
            case "kitchen": return <CookingPot size={16} />;
            case "order": return <ShoppingCart size={16} />;
            case "payment": return <BadgeDollarSign size={16} />;
            case "created": return <SquarePen size={16} />;
            case "stock": return <Info size={16} />;
            case "reservation": return <CalendarFold size={16} />;
            default: return <Bell size={16} />;
        }
    };

    const getIconColors = (type: Notification["type"]) => {
        switch (type) {
            case "kitchen": return "bg-gray-100/10 text-gray-400 border-gray-500/20";
            case "order": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
            case "payment": return "bg-green-500/10 text-green-400 border-green-500/20";
            case "created": return "bg-green-500/10 text-green-400 border-green-500/20";
            case "stock": return "bg-red-500/10 text-red-400 border-red-500/20";
            case "reservation": return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
            default: return "bg-blue-500/10 text-blue-400 border-blue-500/20";
        }
    };

    return (
        <div className={`
      absolute flex flex-col overflow-hidden z-[60] animate-in slide-in-from-left-4 duration-300
      bg-[#1A3A51] border border-white/10 rounded-2xl shadow-2xl
      /* Mobile: Fixed bottom, nearly full width */
      fixed bottom-4 left-4 right-4 w-auto max-h-[80vh]
      /* Desktop: Anchored to sidebar */
      sm:absolute sm:left-[80px] sm:bottom-20 sm:w-[380px] sm:max-h-[500px]
    `}>
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-white/5 shrink-0">
                <h5 className="text-white font-semibold text-base">{t('title')}</h5>
                <div className="flex items-center gap-4">
                    <button className="text-[#FFAB2D] text-xs font-medium hover:underline">
                        {t('markAllRead')}
                    </button>
                    <button onClick={onClose} className="text-white/40 hover:text-white sm:hidden">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="p-2 bg-black/10 flex gap-1 overflow-x-auto no-scrollbar shrink-0">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveTab(cat)}
                        className={`
              px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap
              ${activeTab === cat
                                ? "bg-white text-[#1A3A51] shadow-sm"
                                : "text-white/60 hover:text-white hover:bg-white/5"
                            }
            `}
                    >
                        {t(`tabs.${cat}`)}
                        {cat === "unread" && <span className="ml-1.5 px-1.5 py-0.5 bg-red-500 text-white text-[10px] rounded-full">4</span>}
                        {cat === "kitchen" && <span className="ml-1.5 px-1.5 py-0.5 bg-red-500 text-white text-[10px] rounded-full">5</span>}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                <div className="p-3">
                    <h6 className="text-white/40 text-[11px] font-bold uppercase tracking-wider mb-3">Today</h6>

                    <div className="space-y-1">
                        {filteredNotifications.length > 0 ? (
                            filteredNotifications.map((n) => (
                                <div
                                    key={n.id}
                                    className="group p-3 rounded-xl hover:bg-white/5 transition-all relative cursor-pointer"
                                >
                                    <div className="flex gap-3">
                                        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${getIconColors(n.type)}`}>
                                            {getIcon(n.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white/70 text-[13px] leading-relaxed">
                                                {n.message}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-2 text-white/40 text-[11px]">
                                                <Clock size={12} />
                                                <span>{n.time}</span>
                                            </div>
                                            {n.type === "created" && (
                                                <div className="flex items-center gap-2 mt-3">
                                                    <button className="px-3 py-1 bg-[#FFAB2D] text-[#1A3A51] text-xs font-bold rounded-md hover:bg-[#FFB952] transition-colors">Accept</button>
                                                    <button className="px-3 py-1 bg-white/10 text-white text-xs font-bold rounded-md hover:bg-white/20 transition-colors">Decline</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {!n.isRead && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full" />
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="py-10 text-center">
                                <p className="text-white/20 text-sm">{t('empty')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
