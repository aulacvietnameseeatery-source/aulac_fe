"use client";

import React, { useMemo, useRef } from "react";
import { X, Printer, Clock } from "lucide-react";
import { format } from "date-fns";
import type { KitchenOrder } from "../types/kitchen.types";
import { isProcessedItemStatus, normalizeKitchenItemStatus } from "../utils/kitchen-status";

interface KitchenPrintModalProps {
    order: KitchenOrder;
    isOpen: boolean;
    onClose: () => void;
    t: any;
}

export function KitchenPrintModal({ order, isOpen, onClose, t }: KitchenPrintModalProps) {
    const printRef = useRef<HTMLDivElement>(null);

    const formattedTime = order.createdAt ? format(new Date(order.createdAt), "HH:mm") : "-";
    const formattedDate = order.createdAt ? format(new Date(order.createdAt), "dd/MM/yyyy") : "-";

    const processedCount = useMemo(
        () =>
            order.items.filter((item) => {
                const s = normalizeKitchenItemStatus(item.itemStatus);
                return isProcessedItemStatus(s);
            }).length,
        [order.items],
    );

    const handlePrint = () => {
        const printContent = printRef.current;
        if (!printContent) return;

        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        const styles = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
            .map((s) => s.outerHTML)
            .join("");

        printWindow.document.write(`
            <html>
                <head>
                    <title>Kitchen Ticket #${order.orderId}</title>
                    ${styles}
                    <style>
                        body { background: #fff !important; margin: 0; padding: 16px; }
                        #print-area { width: 100% !important; max-width: none !important; border: none !important; box-shadow: none !important; }
                    </style>
                </head>
                <body>
                    <div id="print-area">${printContent.innerHTML}</div>
                    <script>
                        setTimeout(() => {
                            window.print();
                            window.close();
                        }, 300);
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">{t?.("actions.print") || "Print Order"}</h3>
                        <p className="text-xs text-gray-500">#{order.orderId} - {order.tableCode}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 text-gray-500">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-4 bg-gray-100 max-h-[65vh] overflow-auto custom-scrollbar">
                    <div ref={printRef} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-gray-900 text-white px-4 py-3">
                            <p className="text-sm font-bold">Kitchen Ticket</p>
                            <p className="text-xs text-gray-200">Table {order.tableCode} - #{order.orderId}</p>
                        </div>

                        <div className="px-4 py-3 border-b border-gray-100 text-xs text-gray-600 space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span>Token No</span>
                                <span className="font-semibold text-gray-900">{order.orderId % 100}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />Time</span>
                                <span className="font-semibold text-gray-900">{formattedTime}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Date</span>
                                <span className="font-semibold text-gray-900">{formattedDate}</span>
                            </div>
                        </div>

                        <div className="px-4 py-2">
                            {order.items.map((item) => (
                                <div key={item.orderItemId} className="py-2.5 border-b last:border-b-0 border-gray-100">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-sm font-semibold text-gray-800">{item.dishName}</span>
                                        <span className="text-sm font-bold text-gray-900">x{item.quantity}</span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 mt-0.5">{normalizeKitchenItemStatus(item.itemStatus)}</p>
                                    {item.note ? <p className="text-[11px] text-gray-600 mt-1">Note: {item.note}</p> : null}
                                    {item.rejectReason ? <p className="text-[11px] text-red-600 mt-1">Reject: {item.rejectReason}</p> : null}
                                </div>
                            ))}
                        </div>

                        <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 text-xs text-gray-600 flex items-center justify-between">
                            <span>Processed</span>
                            <span className="font-semibold text-gray-900">{processedCount}/{order.items.length}</span>
                        </div>
                    </div>
                </div>

                <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
                    <button onClick={onClose} className="h-9 px-4 rounded-lg bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-100">
                        {t?.("actions.cancel") || "Cancel"}
                    </button>
                    <button onClick={handlePrint} className="h-9 px-4 rounded-lg bg-gray-900 text-white text-sm font-semibold inline-flex items-center gap-2 hover:bg-black">
                        <Printer className="w-4 h-4" />
                        {t?.("actions.print") || "Print"}
                    </button>
                </div>
            </div>
        </div>
    );
}
