import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Calendar as CalIcon, Clock, Users, ChevronDown, ChevronUp, Check, Minus, Plus } from 'lucide-react';
import { useTranslations } from "next-intl";
import { ALDatePicker } from "@/components/ui/al-date-picker";

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
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const todayString = now.toISOString().split('T')[0];

  const formatTimeDisplay = (time24: string) => {
    const [hour, min] = time24.split(':');
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${min} ${ampm}`;
  };

  const toMinutes = (time24: string) => {
    const [hours, minutes] = time24.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const generateTimeSlots = (startHour: number, endHour: number, intervalMinutes: number) => {
    const slots: string[] = [];
    for (let h = startHour; h <= endHour; h++) {
      for (let m = 0; m < 60; m += intervalMinutes) {
        if (h === endHour && m > 0) break;

        const hourStr = h.toString().padStart(2, '0');
        const minStr = m.toString().padStart(2, '0');
        slots.push(`${hourStr}:${minStr}`);
      }
    }
    return slots;
  };

  const allTimeSlots = useMemo(() => generateTimeSlots(11, 22, 30), []);

  const availableTimeSlots = useMemo(() => {
    if (date !== todayString) return allTimeSlots;

    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return allTimeSlots.filter((slot) => toMinutes(slot) >= nowMinutes);
  }, [allTimeSlots, date, now, todayString]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsTimeDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            inputSize="sm"
            groupClassName="!bg-stone-50 !border-stone-200 !rounded-xl !h-[54px]"
            className="text-sm sm:text-base font-semibold"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t("time")}<span className="text-red-500">*</span></label>
          <div className="relative" ref={dropdownRef}>
            <div
              onClick={() => setIsTimeDropdownOpen((prev) => !prev)}
              className={`w-full h-[54px] text-sm font-bold text-[#1A3A52] bg-stone-50 border border-stone-200 rounded-xl px-3 pl-9 flex items-center justify-between cursor-pointer transition-all ${isTimeDropdownOpen
                ? 'border-[#1A3A52] ring-1 ring-[#1A3A52]'
                : 'border-stone-300 hover:border-[#1A3A52]'
                }`}
            >
              <span className={time ? '' : 'text-stone-400'}>
                {time ? formatTimeDisplay(time) : t('selectTime')}
              </span>
              {isTimeDropdownOpen ? (
                <ChevronUp size={14} className="text-stone-400" />
              ) : (
                <ChevronDown size={14} className="text-stone-400" />
              )}
            </div>
            <Clock
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
            />

            {isTimeDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-lg shadow-xl max-h-43 overflow-y-auto z-50 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-stone-50 [&::-webkit-scrollbar-thumb]:bg-stone-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-stone-400">
                {availableTimeSlots.length === 0 ? (
                  <div className="px-4 py-2.5 text-sm text-stone-400">{t('selectTime')}</div>
                ) : (
                  availableTimeSlots.map((slot) => {
                    const isSelected = slot === time;
                    return (
                      <div
                        key={slot}
                        onClick={() => {
                          onTimeChange(slot);
                          setIsTimeDropdownOpen(false);
                        }}
                        className={`flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors ${isSelected
                          ? 'bg-[#F0F5F9] text-[#1A3A52] font-bold'
                          : 'text-stone-600 hover:bg-stone-50'
                          }`}
                      >
                        {formatTimeDisplay(slot)}
                        {isSelected && <Check size={14} className="text-[#DEA048]" />}
                      </div>
                    );
                  })
                )}
              </div>
            )}
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