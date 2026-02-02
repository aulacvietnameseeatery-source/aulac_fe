"use client";

import { OrderItem } from "./order-item";
import { useTranslations } from "next-intl";
import {useState} from "react"; // Import hook

export function OrderSummary() {
    const t = useTranslations("ConfirmOrder.OrderSummary");

    // Chuyển mock data thành State để có thể cập nhật note
    const [items, setItems] = useState([
        {
            id: 1,
            price: 24.00,
            quantity: 1,
            image: "/images/confirm-order/order-summary/Lotus Root Salad.png",
            note: "" // Thêm trường note mặc định
        },
        {
            id: 2,
            price: 32.00,
            quantity: 2,
            image: "/images/confirm-order/order-summary/Heritage Pho.png",
            note: ""
        },
    ]);

    const handleNoteChange = (id: number, newNote: string) => {
        setItems(prevItems =>
            prevItems.map(item =>
                item.id === id ? { ...item, note: newNote } : item
            )
        );
    };

    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const taxRate = 0.1;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    return (
        <div className="flex w-full flex-col gap-4">
            {/* Header Section */}
            <div className="flex flex-col items-center gap-4">
                <h1 className="font-display text-[48px] font-bold leading-[48px] text-[#1A3A52]">
                    {t("title")}
                </h1>
                <div className="h-1 w-12 bg-[#C9A961]" />
            </div>

            {/* Bill Card */}
            <div className="mt-8 flex w-full flex-col gap-8 rounded-[2px] bg-white p-8 shadow-[0px_1px_2px_rgba(0,0,0,0.05)] outline outline-1 outline-[#1A3A52]/5">

                {/* List Dishes */}
                <div className="flex flex-col gap-8 border-b border-[#1A3A52]/5 pb-4">
                    <h2 className="font-display text-[20px] font-bold leading-[28px] text-[#1A3A52]">
                        {t("section_title")}
                    </h2>
                    <div className="flex flex-col gap-8">
                        {items.map((item) => (
                            <OrderItem
                                key={item.id}
                                {...item}
                                onNoteChange={(newNote) => handleNoteChange(item.id, newNote)}
                                onIncrease={() => console.log("Inc", item.id)}
                                onDecrease={() => console.log("Dec", item.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Totals Breakdown */}
                <div className="flex flex-col gap-3 border-t border-[#1A3A52]/10 pt-8">
                    <div className="flex justify-between">
                        <span className="font-body text-[14px] font-normal text-[#1A3A52]/60">{t("subtotal")}</span>
                        <span className="font-body text-[14px] font-normal text-[#1A3A52]/60">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-body text-[14px] font-normal text-[#1A3A52]/60">{t("tax")}</span>
                        <span className="font-body text-[14px] font-normal text-[#1A3A52]/60">${tax.toFixed(2)}</span>
                    </div>

                    {/* Grand Total */}
                    <div className="mt-4 flex justify-between">
                        <span className="font-display text-[20px] font-bold leading-[28px] text-[#1A3A52]">{t("total")}</span>
                        <span className="font-display text-[20px] font-bold leading-[28px] text-[#1A3A52]">${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}