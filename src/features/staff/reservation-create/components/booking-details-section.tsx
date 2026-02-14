import React from 'react';
import { AlertCircle, Calendar as CalIcon, Clock, Users } from 'lucide-react';
import { useTranslations } from "next-intl";

interface Props {
  date: string;
  time: string;
  partySize: number | '';
  validationError?: string | null;
  onDateChange: (val: string) => void;
  onTimeChange: (val: string) => void;
  onSizeChange: (val: number | '') => void;
}

export const BookingDetailsSection: React.FC<Props> = ({
  date, time, partySize, validationError, onDateChange, onTimeChange, onSizeChange
}) => {
  const t = useTranslations("StaffReservation.booking");

  const now = new Date();
  const todayString = now.toISOString().split('T')[0];

  const currentHours = now.getHours().toString().padStart(2, '0');
  const currentMinutes = now.getMinutes().toString().padStart(2, '0');
  const currentTimeString = `${currentHours}:${currentMinutes}`;

  const minTime = date === todayString ? currentTimeString : undefined;
  return (
    <>
      <div className="flex items-center gap-2 text-slate-900 font-semibold text-lg border-b border-slate-100 pb-4">
        <CalIcon size={24} className="text-blue-600" />
        <h2>{t("sectionTitle")}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t("date")}<span className="text-red-500">*</span></label>
          <input type="date" min={todayString} value={date} onChange={(e) => onDateChange(e.target.value)} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t("time")}<span className="text-red-500">*</span></label>
          <div className="relative">
            <input type="time" min={minTime} value={time} onChange={(e) => onTimeChange(e.target.value)} className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-colors
                ${validationError ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-500'}`} />
            {/* <Clock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} /> */}
          </div>
          {validationError && (
            <div className="flex items-center gap-1 text-red-500 text-xs mt-1.5 font-medium animate-pulse">
                <AlertCircle size={12} />
                <span>{validationError}</span>
            </div>
          )}
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t("partySize")}<span className="text-red-500">*</span></label>
          <div className="relative">
            <input type="number" min="1" value={partySize} onChange={(e) => onSizeChange(e.target.value ? parseInt(e.target.value) : '')} placeholder={t("enterSize")} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <Users className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
          </div>
        </div>
      </div>
    </>
  );
};