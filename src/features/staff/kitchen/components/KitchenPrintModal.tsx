"use client";

import React, { forwardRef, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Printer } from "lucide-react";
import type { KitchenOrder, KitchenOrderItem } from "../types/kitchen.types";

// --- 1. COMPONENT BẢN IN ---
interface KitchenPrintDocumentProps {
    order: KitchenOrder;
    translations: { [key: string]: string };
}

const formatTime = (date?: string | Date) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
};

export const KitchenPrintDocument = forwardRef<HTMLDivElement, KitchenPrintDocumentProps>(
    ({ order, translations: t }, ref) => {
        const printTime = new Date();

        const newItems = order.items.filter(i => i.itemStatus === 'CREATED');
        const inProgressItems = order.items.filter(i => i.itemStatus === 'IN_PROGRESS');
        const completedItems = order.items.filter(i => 
            ['READY', 'SERVED', 'REJECTED', 'CANCELLED'].includes(i.itemStatus)
        );

        const renderItem = (item: KitchenOrderItem) => {
            const isNew = item.itemStatus === 'CREATED';
            const isCancelled = item.itemStatus === 'CANCELLED';
            const isRejected = item.itemStatus === 'REJECTED';

            let prefix = '';
            if (item.itemStatus === 'IN_PROGRESS') prefix = '[~] ';
            if (item.itemStatus === 'READY') prefix = '[✓] ';
            if (item.itemStatus === 'SERVED') prefix = '[DONE] ';
            if (isCancelled) prefix = '[X] ';
            if (isRejected) prefix = '[!] ';

            return (
                <div key={item.dishName + item.itemStatus} className="mb-3">
                    <div className={`
                        flex items-start gap-2 
                        ${isNew ? 'text-base font-bold' : 'text-sm font-normal'} 
                        ${isCancelled ? 'line-through text-gray-700' : ''}
                        uppercase leading-tight
                    `}>
                        <span className="shrink-0 whitespace-nowrap">
                            {prefix}{item.quantity}X
                        </span>
                        <span className="flex-1 break-words">
                            {item.dishName}
                        </span>
                    </div>

                    {item.note && (
                        <div className={`ml-8 mt-1 text-sm lowercase first-letter:uppercase ${isNew ? 'font-semibold' : 'font-normal'}`}>
                            - {item.note}
                        </div>
                    )}

                    {isRejected && item.rejectReason && (
                        <div className="ml-8 mt-1 p-1.5 border border-black text-xs uppercase font-bold">
                            {t['reason']}: {item.rejectReason}
                        </div>
                    )}
                </div>
            );
        };

        return (
            <div
                ref={ref}
                className="w-full max-w-[80mm] mx-auto bg-white text-black p-4 font-mono"
                style={{ color: '#000' }} // Ép màu đen toàn cục giống OrderPrintDocument
            >
                {/* HEADER */}
                <div className="text-center mb-4 mt-2">
                    <h1 className="text-2xl font-black uppercase tracking-widest">{t['title']}</h1>
                    <div className="text-lg font-bold mt-1">{t['order']} #{order.orderId}</div>
                    <div className="text-lg font-bold">{t['table']} {order.tableCode}</div>
                    <div className="text-sm font-bold mt-1">{t['time']} {formatTime(order.createdAt)}</div>
                </div>

                <div className="border-t-2 border-black border-dashed mb-4"></div>

                {/* NEW ITEMS */}
                {newItems.length > 0 && (
                    <div className="mb-4">
                        <div className="text-center font-black text-lg bg-black text-white py-1 mb-3 uppercase tracking-widest">
                            *** {t['newItem']} ***
                        </div>
                        {newItems.map(renderItem)}
                    </div>
                )}

                {/* IN PROGRESS ITEMS */}
                {inProgressItems.length > 0 && (
                    <div className="mb-4">
                        <div className="border-b border-black mb-2 text-sm font-bold uppercase">
                            {t['cooking']}
                        </div>
                        {inProgressItems.map(renderItem)}
                    </div>
                )}

                {/* COMPLETED ITEMS */}
                {completedItems.length > 0 && (
                    <div className="mb-4">
                        {(newItems.length > 0 || inProgressItems.length > 0) && (
                            <div className="border-t border-black mb-2 border-dotted"></div>
                        )}
                        <div className="mb-2 text-xs font-bold uppercase tracking-wider">
                            --- {t['processed']} ---
                        </div>
                        {completedItems.map(renderItem)}
                    </div>
                )}

                <div className="border-t-2 border-black border-dashed mt-6 mb-2"></div>

                {/* FOOTER */}
                <div className="text-center text-xs font-normal space-y-1">
                    <p>{t['printedAt']} {formatTime(printTime)}</p>
                    <p>--- {t['end']} ---</p>
                </div>
            </div>
        );
    }
);

KitchenPrintDocument.displayName = 'KitchenPrintDocument';


// --- 2. MODAL WRAPPER ---
interface KitchenPrintModalProps {
    order: KitchenOrder;
    isOpen: boolean;
    onClose: () => void;
    t: any; // Hàm translations truyền từ component cha
}

export const KitchenPrintModal: React.FC<KitchenPrintModalProps> = ({ order, isOpen, onClose, t }) => {
    const printRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    const handleClose = (event?: React.MouseEvent) => {
        event?.stopPropagation();
        document.body.style.overflow = 'unset';
        onClose();
    };

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = previousOverflow; };
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    // Map các key dịch thuật để truyền vào Document
    const printTranslations = {
        title: t?.("kitchen.title") || "KITCHEN",
        order: t?.("kitchen.order") || "ORDER",
        table: t?.("kitchen.table") || "TABLE",
        time: t?.("kitchen.time") || "TIME",
        newItem: t?.("kitchen.newItem") || "NEW ITEM",
        cooking: t?.("kitchen.cooking") || "Cooking",
        processed: t?.("kitchen.processed") || "Processed",
        reason: t?.("kitchen.reason") || "REASON",
        printedAt: t?.("kitchen.printedAt") || "PRINTED AT",
        end: t?.("kitchen.end") || "END",
        printTicket: t?.("kitchen.printTicket") || "Print Ticket",
        cancel: t?.("kitchen.cancel") || "Cancel",
        print: t?.("kitchen.print") || "Print"
    };

    const handlePrint = () => {
        window.print();
    };

    return createPortal(
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => handleClose(e)}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
            >
                {/* Header Modal */}
                <div
                    className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <Printer className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">
                                {printTranslations.printTicket}
                            </h3>
                            <p className="text-xs text-gray-500">Order #{order.orderId}</p>
                        </div>
                    </div>
                    <button onClick={(e) => handleClose(e)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Preview Area */}
                <div
                    className="flex-1 overflow-auto p-8 bg-gray-100/50 flex justify-center custom-scrollbar"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* KHU VỰC IN: Dùng đúng id="receipt-print-area" để ăn CSS in ấn toàn cục */}
                    <div id="receipt-print-area" className="w-full max-w-[80mm] bg-white shadow-xl rounded-sm border border-gray-300 overflow-hidden" style={{ height: 'fit-content' }}>
                        <KitchenPrintDocument 
                            ref={printRef} 
                            order={order} 
                            translations={printTranslations} 
                        />
                    </div>
                </div>

                {/* Footer Modal */}
                <div
                    className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button onClick={(e) => handleClose(e)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors">
                        {printTranslations.cancel}
                    </button>
                    <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95">
                        <Printer className="w-4 h-4" />
                        {printTranslations.print}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};