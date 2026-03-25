import React from 'react';
import { MapPin, CheckCircle, Users } from 'lucide-react';
import { TableOptionDto } from '../types/types';
import { useTranslations } from "next-intl";

interface Props {
  options: TableOptionDto[];
  selectedOptionId: string | null;
  isLoading: boolean;
  isChecked: boolean;
  onSelectOption: (id: string) => void;
  compact?: boolean;
}

export const TableSelectionGrid: React.FC<Props> = ({
  options, selectedOptionId, isLoading, isChecked, onSelectOption, compact = false
}) => {
  const t = useTranslations("reservations.staff.table");
  const heightClass = compact
    ? "h-[210px] sm:h-[240px] lg:h-[260px]"
    : "h-[220px] sm:h-[260px] lg:h-[300px]";

  return (
    <div className={`bg-slate-50 rounded-xl p-4 sm:p-5 border-2 border-dashed border-slate-200 ${heightClass} flex flex-col`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-slate-700 uppercase flex items-center gap-2"><MapPin size={16} />{t("availability")}</h3>
        {isLoading ? <span className="text-sm text-blue-600 flex items-center gap-2 animate-pulse">{t("scanning")}</span> 
        : isChecked && options.length > 0 ? <span className="text-sm text-green-600 flex items-center gap-2 font-medium"><CheckCircle size={16} />{t("found", { count: options.length })}</span> : null}
      </div>
      
      <div className="relative flex-1 min-h-0 w-full">
        {options.length > 0 && (
          <div className="h-full overflow-y-auto pr-1">
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {options.map((option) => (
                <button key={option.optionId} onClick={() => onSelectOption(option.optionId)} 
                  className={`relative rounded-lg p-3 flex flex-col items-center justify-center gap-1 transition-all border-2 
                    ${selectedOptionId === option.optionId ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-105' : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'}`}>
                  <span className="font-bold text-base text-center">{option.tableCodes}</span>
                  <div className={`text-xs flex gap-2 ${selectedOptionId === option.optionId ? 'text-blue-100' : 'text-slate-500'}`}>
                    <span><Users size={10} className="inline"/> {option.totalCapacity}</span><span>•</span><span>{option.zone}</span>
                  </div>
                  <div className={`text-[11px] mt-1 ${selectedOptionId === option.optionId ? 'text-blue-100' : 'text-slate-500'}`}>
                    {t("tableCount", { count: option.tableCount })}{option.isBestFit ? ` • ${t("bestFit")}` : ''}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {!isChecked && !isLoading && (
          <div className="h-full flex items-center justify-center text-center text-slate-400 py-4">
            <p>{t("emptyHint")}</p>
          </div>
        )}
        
        {!isLoading && isChecked && options.length === 0 && (
          <div className="h-full flex items-center justify-center text-center text-red-500">{t("noTable")}</div>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/55 rounded-lg">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        )}
      </div>
    </div>
  );
};