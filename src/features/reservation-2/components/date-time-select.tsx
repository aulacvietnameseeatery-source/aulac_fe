import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface DateTimeSelectProps {
    date: string;
    time: string;
    onDateTimeChange: (newDate: string, newTime: string) => void;
}

export default function DateTimeSelect({
    date,
    time,
    onDateTimeChange
}: DateTimeSelectProps) {
    const t = useTranslations('Reservation.Sidebar');

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onDateTimeChange(e.target.value, time);
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-md border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3 mb-6 sticky top-20 z-30">
            <div className="flex-1 w-full md:w-auto min-w-0">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">
                    {t('datetime.selectDate')}
                </label>
                <div className="relative">
                    <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                    <input
                        type="date"
                        value={date}
                        onChange={handleDateChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-8 pr-2 text-sm font-bold text-[#1A3A52] focus:outline-none focus:border-[#1A3A52]"
                    />
                </div>
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-8 pr-2 text-sm font-bold text-[#1A3A52] focus:outline-none focus:border-[#1A3A52] appearance-none"
                    >
                        {Array.from({ length: 12 }, (_, i) => i + 11).flatMap(h =>
                            ['00', '30'].map(m => {
                                const hour = h.toString().padStart(2, '0');
                                return `${hour}:${m}`;
                            })
                        ).map(slot => (
                            <option key={slot} value={slot}>
                                {slot}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}
