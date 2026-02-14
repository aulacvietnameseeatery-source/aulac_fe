import React from 'react';
import { PhoneIncoming, Footprints, ChevronDown } from 'lucide-react';
import { BookingSource, BookingStatus } from '../types/types';
import { useTranslations } from "next-intl";

interface Props {
  source: BookingSource;
  status: BookingStatus;
  onSourceChange: (source: BookingSource) => void;
  onStatusChange: (status: BookingStatus) => void;
}

export const StatusSection: React.FC<Props> = ({ source, status, onSourceChange, onStatusChange }) => {
  const t = useTranslations("StaffReservation.status");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t("source")}</label>
        <div className="relative">
          <select 
            value={source}
            onChange={(e) => onSourceChange(e.target.value as BookingSource)}
            className="w-full appearance-none bg-white border border-slate-300 text-slate-800 font-medium py-3 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="phone">{t("phone")}</option>
            <option value="walk_in">{t("walkIn")}</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
            {source === 'phone' ? <PhoneIncoming size={18} /> : <Footprints size={18}/>}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t("status")}</label>
        <div className="relative">
          <select 
            value={status}
            onChange={(e) => onStatusChange(e.target.value as BookingStatus)}
            className={`w-full appearance-none border border-slate-300 font-medium py-3 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
              ${source === 'phone' ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white text-slate-800'}`}
            disabled={source === 'phone'} 
          >
            <option value="confirmed">{t("confirmed")}</option>
            {source === 'walk_in' && <option value="checked_in">{t("checkedIn")}</option>}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
            <ChevronDown size={16} />
          </div>
        </div>
        {source === 'phone' && (
          <p className="text-[11px] text-slate-400 mt-1 italic">{t("phoneHint")}</p>
        )}
      </div>
    </div>
  );
};