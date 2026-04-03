import React from "react";
import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";

interface NotesInfoSectionProps {
    notes?: string;
}

export const NotesInfoSection = ({ notes }: NotesInfoSectionProps) => {
    const t = useTranslations("reservations.management.detail.notes");

    return (
        <div className="border-b border-slate-100 pb-6 sm:pb-8 last:border-0 relative">
            <div className="mb-4 sm:mb-6">
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-lg">
                    <FileText size={24} className="text-blue-600" />
                    <h2>{t("title")}</h2>
                </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 min-h-[100px] text-slate-700 leading-relaxed">
                {notes || <span className="text-slate-400 italic">{t("noNotes")}</span>}
            </div>
        </div>
    );
};
