import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ALDatePicker } from "@/components/ui/al-date-picker";

interface DateTimeSelectProps {
    date: string;
    time: string;
    onDateTimeChange: (newDate: string, newTime: string) => void;
    isMultiSelect: boolean;
    onMultiSelectChange: (isMulti: boolean) => void;
}

export default function DateTimeSelect({
    date,
    time,
    onDateTimeChange,
    isMultiSelect,
    onMultiSelectChange
}: DateTimeSelectProps) {
    const t = useTranslations('reservations.public.sidebar');
    const tControls = useTranslations('reservations.public.controls');

    const handleDateChange = (val: string) => {
        onDateTimeChange(val, time);
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-md border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3 mb-6 sticky top-20 z-30">
            <div className="flex-1 w-full md:w-auto min-w-0">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">
                    {t('datetime.selectDate')}
                </label>
                <ALDatePicker
                    value={date}
                    onChange={handleDateChange}
                    minDate={new Date().toISOString().split('T')[0]}
                    placeholder={t('datetime.selectDate')}
                    displayFormat="dd/MM/yyyy"
                    inputSize="sm"
                />
            </div>

            <div className="flex-1 w-full md:w-auto min-w-0">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">
                    {t('datetime.selectTime')}
                </label>
                <div className="relative">
                    <Clock size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                    <select
                        value={time}
                        onChange={(e) => onDateTimeChange(date, e.target.value)}
                        className="w-full bg-slate-50 border border border-[#D5BA98]/60 rounded-lg py-2 pl-8 pr-2 text-sm font-bold text-[#1A3A52] focus:outline-none focus:border-[#1A3A52] appearance-none"
                    >
                        {[
                            ...Array.from({ length: 4 }, (_, i) => i + 11).flatMap(h =>
                                ['00', '30'].map(m => {
                                    if (h === 11 && m === '00') return null;
                                    if (h === 14 && m === '30') return `${h}:${m}`;
                                    if (h === 14 && m > '30') return null;
                                    return `${h.toString().padStart(2, '0')}:${m}`;
                                })
                            ),
                            ...Array.from({ length: 5 }, (_, i) => i + 18).flatMap(h =>
                                ['00', '30'].map(m => {
                                    if (h === 18 && m === '00') return null;
                                    if (h === 22 && m === '30') return `${h}:${m}`;
                                    if (h === 22 && m > '30') return null;
                                    return `${h.toString().padStart(2, '0')}:${m}`;
                                })
                            )
                        ].filter(Boolean).map(slot => (
                            <option key={slot as string} value={slot as string}>
                                {slot}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="flex-1 w-full md:w-auto min-w-0">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">
                    {tControls('selectMode')}
                </label>
                <div className="bg-stone-100 p-1 rounded-lg flex items-center shadow-inner border border-stone-200 h-[38px]">
                    <button
                        onClick={() => onMultiSelectChange(false)}
                        className={`
                            flex-1 flex items-center justify-center gap-2 px-3 h-full rounded-md text-sm font-bold transition-all duration-300
                            ${!isMultiSelect
                                ? 'bg-white text-[#1A3A52] shadow-sm ring-1 ring-black/5'
                                : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/50'}
                        `}
                    >
                        <div className={`p-0.5 rounded-full ${!isMultiSelect ? 'bg-[#1A3A52]/10 text-[#1A3A52]' : 'bg-transparent text-current'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>
                        <span className="truncate">{tControls('single')}</span>
                    </button>

                    <button
                        onClick={() => onMultiSelectChange(true)}
                        className={`
                            flex-1 flex items-center justify-center gap-2 px-3 h-full rounded-md text-sm font-bold transition-all duration-300
                            ${isMultiSelect
                                ? 'bg-white text-[#1A3A52] shadow-sm ring-1 ring-black/5'
                                : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/50'}
                        `}
                    >
                        <div className={`p-0.5 rounded-full ${isMultiSelect ? 'bg-[#1A3A52]/10 text-[#1A3A52]' : 'bg-transparent text-current'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                        <span className="truncate">{tControls('multiple')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
