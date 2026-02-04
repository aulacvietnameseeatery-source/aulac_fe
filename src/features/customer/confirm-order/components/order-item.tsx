"use client";

import Image from "next/image";
import { Minus, Plus, PenLine, MessageSquarePlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface OrderItemProps {
    id: number;
    image: string;
    price: number;
    quantity: number;
    // 👇 Props mới cho Note
    note?: string;
    onNoteChange?: (note: string) => void;

    onIncrease?: () => void;
    onDecrease?: () => void;
}

export function OrderItem({
                              id,
                              image,
                              price,
                              quantity,
                              note = "", // Mặc định rỗng
                              onNoteChange,
                              onIncrease,
                              onDecrease,
                          }: OrderItemProps) {
    const t = useTranslations("ConfirmOrder.OrderItem");
    const tSummary = useTranslations("ConfirmOrder.OrderSummary");

    // State nội bộ để bật tắt chế độ sửa note
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [tempNote, setTempNote] = useState(note);

    const name = tSummary(`items.${id}_name` as any);
    const category = tSummary(`items.${id}_category` as any);

    const handleSaveNote = () => {
        onNoteChange?.(tempNote);
        setIsEditingNote(false);
    };

    return (
        <div className="flex w-full flex-col border-b border-[#1A3A52]/5 py-6 last:border-0">
            {/* === MAIN ROW: INFO & ACTIONS === */}
            <div className="flex w-full items-start justify-between">

                {/* Left: Image & Info */}
                <div className="flex items-start gap-4 md:gap-6">
                    <div className="relative h-16 w-16 md:h-20 md:w-20 flex-shrink-0 overflow-hidden rounded-[4px] bg-[#F6F4EF] shadow-sm">
                        <Image src={image} alt={name} fill className="object-cover" />
                    </div>

                    <div className="flex flex-col gap-1">
                        <h3 className="font-display text-[16px] md:text-[18px] font-bold leading-tight text-[#1A3A52]">
                            {name}
                        </h3>
                        <span className="font-body text-[11px] md:text-[12px] font-normal uppercase tracking-[1px] text-[#1A3A52]/50">
                            {category}
                        </span>

                        {/* 👇 TRIGGER ADD NOTE BUTTON */}
                        {!isEditingNote && !note && (
                            <button
                                onClick={() => setIsEditingNote(true)}
                                className="mt-2 flex items-center gap-1.5 text-[12px] font-medium text-[#C5A059] transition-colors hover:text-[#1A3A52] hover:underline"
                            >
                                <MessageSquarePlus className="w-3.5 h-3.5" />
                                {t("add_note")}
                            </button>
                        )}
                    </div>
                </div>

                {/* Right: Quantity & Price */}
                <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-3 md:gap-4 rounded-full bg-[#FAFAFA] px-2 py-1 md:px-3 md:py-2 border border-[#E8E4DF]">
                        <button onClick={onDecrease} className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#1A3A52] shadow-sm hover:bg-[#1A3A52] hover:text-white transition-all">
                            <Minus className="w-3 h-3" />
                        </button>
                        <span className="min-w-[16px] text-center font-body text-[14px] font-bold text-[#1A3A52]">
                            {quantity}
                        </span>
                        <button onClick={onIncrease} className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#1A3A52] shadow-sm hover:bg-[#1A3A52] hover:text-white transition-all">
                            <Plus className="w-3 h-3" />
                        </button>
                    </div>
                    <span className="font-display text-[16px] font-bold text-[#1A3A52]">
                        ${(price * quantity).toFixed(2)}
                    </span>
                </div>
            </div>

            {/* === NOTE SECTION (Hiển thị bên dưới) === */}

            {/* 1. Form nhập note */}
            {isEditingNote && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <textarea
                        value={tempNote}
                        onChange={(e) => setTempNote(e.target.value)}
                        placeholder={t("note_placeholder")}
                        className="w-full rounded-lg border border-[#C5A059]/30 bg-[#FFFDF9] p-3 text-[13px] text-[#1A3A52] placeholder:text-[#1A3A52]/40 focus:border-[#C5A059] focus:outline-none focus:ring-1 focus:ring-[#C5A059] min-h-[60px]"
                        autoFocus
                    />
                    <div className="mt-2 flex justify-end gap-3">
                        <button
                            onClick={() => setIsEditingNote(false)}
                            className="text-[12px] font-medium text-[#1A3A52]/60 hover:text-[#1A3A52]"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveNote}
                            className="rounded-full bg-[#1A3A52] px-4 py-1.5 text-[12px] font-bold text-white transition-transform active:scale-95"
                        >
                            {t("note_saved")}
                        </button>
                    </div>
                </div>
            )}

            {/* 2. Hiển thị note đã lưu */}
            {!isEditingNote && note && (
                <div
                    onClick={() => { setTempNote(note); setIsEditingNote(true); }}
                    className="group mt-3 flex cursor-pointer items-start gap-2 rounded-md bg-[#F6F4EF] p-3 transition-colors hover:bg-[#EAE8E2]"
                >
                    <PenLine className="mt-0.5 h-3.5 w-3.5 text-[#C5A059]" />
                    <p className="flex-1 font-body text-[13px] italic text-[#1A3A52]/80 leading-relaxed">
                        &quot;{note}&quot;
                    </p>
                    <span className="text-[10px] font-bold uppercase text-[#1A3A52]/40 opacity-0 transition-opacity group-hover:opacity-100">
                        {t("edit_note")}
                    </span>
                </div>
            )}
        </div>
    );
}