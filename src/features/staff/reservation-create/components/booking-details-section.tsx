import React from 'react';
import { AlertCircle, Calendar as CalIcon, Clock, Users } from 'lucide-react';
import { useTranslations } from "next-intl";
import { ALDatePicker } from "@/components/ui/al-date-picker";
import { ALInput } from '@/components/ui/al-input';

interface Props {
  date: string;
  time: string;
  partySize: number | '';
  validationError?: string | null;
  onDateChange: (val: string) => void;
  onTimeChange: (val: string) => void;
  onSizeChange: (val: number | '') => void;
}

const BookingDetailsSectionComponent: React.FC<Props> = ({
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
      <div className="flex items-center gap-2 text-slate-900 font-semibold text-lg">
        <CalIcon size={24} className="text-blue-600" />
        <h2>{t("sectionTitle")}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-0">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t("date")}<span className="text-red-500">*</span></label>
          <ALDatePicker
            value={date}
            onChange={onDateChange}
            minDate={todayString}
            placeholder={t("date")}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t("time")}<span className="text-red-500">*</span></label>
          <div className="relative">
            <ALInput 
            type="time" 
            min={minTime} 
            value={time} 
            onChange={(e: any) => onTimeChange(e.target.value)}
            error={validationError || undefined} 
          />
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
            <ALInput 
              type="number" 
              min="1" 
              value={partySize} 
              onChange={(e: any) => onSizeChange(e.target.value ? parseInt(e.target.value) : '')} 
              placeholder={t("enterSize")} 
            />
          </div>
        </div>
      </div>
    </>
  );
};

export const BookingDetailsSection = React.memo(BookingDetailsSectionComponent);