import React, { useMemo } from 'react';
import { PhoneIncoming, Footprints, ChevronDown } from 'lucide-react';
import { BookingSource, BookingStatus } from '../types/types';
import { useTranslations } from "next-intl";
import { ALCombobox } from '@/components/ui/al-combobox';

interface Props {
  source: BookingSource;
  status: BookingStatus;
  onSourceChange: (source: BookingSource) => void;
  onStatusChange: (status: BookingStatus) => void;
}

export const StatusSection: React.FC<Props> = ({ source, status, onSourceChange, onStatusChange }) => {
  const t = useTranslations("reservations.staff.status");

  // Format options cho Combobox
  const sourceOptions = useMemo(() => [
    { value: 'phone', label: t("phone") },
    { value: 'walk_in', label: t("walkIn") }
  ], [t]);

  const statusOptions = useMemo(() => {
    const options = [{ value: 'confirmed', label: t("confirmed") }];
    if (source === 'walk_in') {
      options.push({ value: 'checked_in', label: t("checkedIn") });
    }
    return options;
  }, [source, t]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t("source")}</label>
        <div className="relative">
          <ALCombobox
            options={sourceOptions}
            value={source}
            onChange={(val) => onSourceChange(val as BookingSource)}
            placeholder={t("source")}
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
            {source === 'phone' ? <PhoneIncoming size={18} /> : <Footprints size={18}/>}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t("status")}</label>
        <ALCombobox
          options={statusOptions}
          value={status}
          onChange={(val) => onStatusChange(val as BookingStatus)}
          disabled={source === 'phone'}
        />
        {source === 'phone' && (
          <p className="text-[11px] text-slate-400 mt-1 italic">{t("phoneHint")}</p>
        )}
      </div>
    </div>
  );
};