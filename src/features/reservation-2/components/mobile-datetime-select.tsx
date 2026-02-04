import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface MobileDateTimeSelectProps {
    date: string;
    time: string;
    onDateTimeChange: (newDate: string, newTime: string) => void;
}

export default function MobileDateTimeSelect({
    date,
    time,
    onDateTimeChange
}: MobileDateTimeSelectProps) {
    const t = useTranslations('Reservation.Sidebar'); // Reusing sidebar translations

    // Simple native date/time pickers for mobile
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onDateTimeChange(e.target.value, time);
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onDateTimeChange(date, e.target.value);
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-md border border-slate-100 flex items-center justify-between gap-3 mb-6 lg:hidden sticky top-20 z-30">
            <div className="flex-1 min-w-0">
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

            <div className="flex-1 min-w-0">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">
                    {t('datetime.selectTime')}
                </label>
                <div className="relative">
                    <Clock size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                    {/* For time, we can use a select or native time input. 
                        Native time input might be better for mobile. 
                        However, our current logic expects HH:mm string. 
                        Let's try a simple select with generated slots to match desktop behavior, 
                        or just input type="time" if we convert format.
                        Let's use a select for consistency with desktop slots. 
                    */}
                    <select
                        value={time}
                        onChange={(e) => onDateTimeChange(date, e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-8 pr-2 text-sm font-bold text-[#1A3A52] focus:outline-none focus:border-[#1A3A52] appearance-none"
                    >
                        {/* Re-generate slots logic or just hardcode for simplicity here? 
                            Ideally should share slot generation logic. 
                            Let's duplicate small logic to avoid complex imports for now. 
                        */}
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
