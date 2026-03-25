import React, { useMemo } from 'react';
import { AlertCircle, Calendar as CalIcon, Clock, Users, Minus, Plus } from 'lucide-react';
import { useTranslations } from "next-intl";
import { ALDatePicker } from "@/components/ui/al-date-picker";
import { ALCombobox } from '@/components/ui/al-combobox';

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
  const t = useTranslations("reservations.staff.booking");
  const toMinutes = (time24: string) => {
    const [hours, minutes] = time24.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const generateTimeSlots = () => {
    const slots: string[] = [];
    // Lunch: 11:30 - 14:30
    for (let h = 11; h <= 14; h++) {
      for (let m = 0; m < 60; m += 30) {
        if (h === 11 && m < 30) continue;
        if (h === 14 && m > 30) break;
        slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      }
    }
    // Dinner: 18:30 - 22:30
    for (let h = 18; h <= 22; h++) {
      for (let m = 0; m < 60; m += 30) {
        if (h === 18 && m < 30) continue;
        if (h === 22 && m > 30) break;
        slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      }
    }
    return slots;
  };

  const todayString = useMemo(() => new Date().toISOString().split('T')[0], []);
  const allTimeSlots = useMemo(() => generateTimeSlots(), []);

  const timeOptions = useMemo(() => {
    const slots = date === todayString
      ? allTimeSlots.filter((slot) => toMinutes(slot) >= (new Date().getHours() * 60 + new Date().getMinutes()))
      : allTimeSlots;

    return slots.map(slot => ({
      value: slot,
      label: slot
    }));
  }, [allTimeSlots, date, todayString]);


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
            displayFormat="dd/MM/yyyy"
            inputSize="sm"
            groupClassName="!bg-stone-50 !border-stone-200 !rounded-xl !h-[54px]"
            className="text-sm sm:text-base font-semibold"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t("time")}<span className="text-red-500">*</span></label>
          <ALCombobox
            options={timeOptions}
            value={time}
            onChange={(val) => onTimeChange(val as string)}
            placeholder={t("selectTime")}
            iconStart={<Clock size={16} className="text-stone-400" />}
            className="!h-[54px] !rounded-xl !bg-stone-50 !border-stone-200"
          />
          {validationError && (
            <div className="flex items-center gap-1 text-red-500 text-xs mt-1.5 font-medium animate-pulse">
              <AlertCircle size={12} />
              <span>{validationError}</span>
            </div>
          )}
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t("partySize")}<span className="text-red-500">*</span></label>
          <div className="flex items-center bg-stone-50 border border-stone-200 rounded-xl py-1 px-1 h-[54px]">
            <button
              type="button"
              onClick={() => onSizeChange(Math.max(1, Number(partySize || 1) - 1))}
              className="p-3 text-stone-500 hover:text-amber-600 transition-colors"
            >
              <Minus size={16} strokeWidth={3} />
            </button>
            <div className="flex-1 text-center font-bold text-[#1A3A52] text-lg">
              {partySize || '-'}
            </div>
            <button
              type="button"
              onClick={() => onSizeChange(Number(partySize || 0) + 1)}
              className="p-3 text-stone-500 hover:text-amber-600 transition-colors"
            >
              <Plus size={16} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export const BookingDetailsSection = React.memo(BookingDetailsSectionComponent);